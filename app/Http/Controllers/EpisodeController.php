<?php

namespace App\Http\Controllers;

use App\Models\Episode;
use App\Models\Anime;
use App\Models\EpisodeVideo;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class EpisodeController extends Controller
{

public function index(Request $request)
{

    
    // جلب قيمة البحث من الطلب
    $search = $request->input('search');

    // إنشاء استعلام أساسي للحلقات مع العلاقة مع الأنمي
    $query = Episode::with('series')->latest();

    // إذا وُجد بحث، أضف شرط البحث
    if (!empty($search)) {
        $query->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', "%{$search}%") // البحث في عنوان الحلقة
              ->orWhere('episode_number', $search) // البحث برقم الحلقة بالضبط
              ->orWhereHas('series', function ($seriesQuery) use ($search) {
                  $seriesQuery->where('name', 'LIKE', "%{$search}%"); // البحث في اسم الأنمي المرتبط
              });
        });
    }

    // تنفيذ الاستعلام مع ترقيم الصفحات
    $episodes = $query->paginate(15);

    // تمرير النتائج إلى واجهة Inertia
    return Inertia::render('Episodes/Index', [
        'episodes' => $episodes,
        'filters' => [
            'search' => $search,
        ],
    ]);
}





public function create()
{
    $animes = Anime::select(
        'id',
        'title',
        'title_en',
        'description',
        'description_en',
        'duration',
        'language',
        'rating',
        'slug',
        'slug_en',
        'cover',   // لإضافة صورة Banner افتراضية
        'image'    // لإضافة صورة Thumbnail افتراضية
    )->get();

    return Inertia::render('Episodes/Create', [
        'animes' => $animes,
    ]);
}




public function store(Request $request)
{
    $data = $request->validate([
        'series_id' => 'required|exists:animes,id',
        'title' => 'required|string|max:255',
        'title_en' => 'nullable|string|max:255',
        'slug' => 'nullable|string|max:255|unique:episodes,slug',
        'slug_en' => 'nullable|string|max:255|unique:episodes,slug_en',
        'episode_number' => [
            'required',
            'integer',
            'min:1',
            Rule::unique('episodes')->where(fn($query) =>
                $query->where('series_id', $request->series_id)
            ),
        ],
        'description' => 'nullable|string',
        'description_en' => 'nullable|string',
        'thumbnail' => 'nullable|file|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        'banner' => 'nullable|file|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        'video_urls' => 'nullable|array', // مصفوفة روابط الفيديو
        'video_urls.*' => 'nullable|string|max:500', // تحقق لكل رابط
        'duration' => 'nullable|integer|min:1',
        'quality' => 'nullable|string|max:50',
        'video_format' => 'nullable|string|max:20',
        'release_date' => 'nullable|date',
        'is_published' => 'nullable|boolean',
        'language' => 'nullable|string|max:10',
        'subtitles' => 'nullable|array',
        'rating' => 'nullable|numeric|min:0|max:10',
    ]);

    $anime = Anime::find($data['series_id']);

    // thumbnail
    if ($request->hasFile('thumbnail')) {
        $data['thumbnail'] = $request->file('thumbnail')->store('episodes', 'public');
    } elseif ($anime && $anime->image) {
        $data['thumbnail'] = $anime->image;
    }

    // banner
    if ($request->hasFile('banner')) {
        $data['banner'] = $request->file('banner')->store('episodes', 'public');
    } elseif ($anime && $anime->cover) {
        $data['banner'] = $anime->cover;
    }

    // إنشاء الحلقة
    $episode = Episode::create($data);

    // تخزين روابط الفيديو في جدول EpisodeVideo الجديد
    if (!empty($data['video_urls'])) {
        foreach ($data['video_urls'] as $url) {
            if ($url) {
                EpisodeVideo::create([
                    'episode_id' => $episode->id,
                    'video_url' => $url,
                    'episode_number' => $episode->episode_number,
                    'anime_title' => $anime->title ?? '',
                    'anime_image' => $anime->image ?? null,
                ]);
            }
        }
    }

    // Notify all users about the new episode
    // Note: For large user bases, this should be queued or handled via a subscription system.
    // For now, we notify all users as requested.
    $users = \App\Models\User::all();
    \Illuminate\Support\Facades\Notification::send($users, new \App\Notifications\NewEpisodeNotification($episode));

    return redirect()->route('episodes.index')->with('success', 'تم إنشاء الحلقة بنجاح');
}

public function edit(Episode $episode)
{
    // تحميل العلاقات المطلوبة
    $episode->load(['series', 'videos']);

    // تنسيق التاريخ قبل الإرسال إلى Inertia
    if (!empty($episode->release_date)) {
        $episode->release_date = \Carbon\Carbon::parse($episode->release_date)->format('Y-m-d');
    }

    // جلب جميع الأنميات مع الحقول المطلوبة
    $animes = Anime::select(
        'id',
        'title',
        'title_en',
        'slug',
        'slug_en',
        'description',
        'description_en',
        'duration',
        'language',
        'rating',
        'image',
        'cover'
    )->get();

    // إرسال البيانات إلى واجهة Vue
    return Inertia::render('Episodes/Edit', [
        'episode' => $episode,
        'animes' => $animes,
    ]);
}



public function update(Request $request, Episode $episode)
{
    // 1. التحقق من صحة البيانات (تأكد من تفعيل التحقق للصور)
    $data = $request->validate([
        'series_id' => 'required|exists:animes,id',
        'title' => 'required|string|max:255',
        'title_en' => 'nullable|string|max:255',
        'slug' => 'nullable|string|max:255|unique:episodes,slug,' . $episode->id,
        'slug_en' => 'nullable|string|max:255|unique:episodes,slug_en,' . $episode->id,
        'episode_number' => [
            'required',
            'integer',
            'min:1',
            Rule::unique('episodes')
                ->ignore($episode->id)
                ->where(fn($query) => $query->where('series_id', $request->series_id)),
        ],
        'description' => 'nullable|string',
        'description_en' => 'nullable|string',
        'thumbnail' => 'nullable|file|image|mimes:jpg,jpeg,png,gif,webp|max:2048', // [مهم] - يجب تفعيله
        'banner' => 'nullable|file|image|mimes:jpg,jpeg,png,gif,webp|max:2048',    // [مهم] - يجب تفعيله
        'video_urls' => 'nullable|array',
        'video_urls.*' => 'nullable|string|max:500',
        'duration' => 'nullable|integer|min:1',
        'quality' => 'nullable|string|max:50',
        'video_format' => 'nullable|string|max:20',
        'release_date' => 'nullable|date',
        'is_published' => 'nullable|boolean',
        'language' => 'nullable|string|max:10',
        'subtitles' => 'nullable|array',
        'rating' => 'nullable|numeric|min:0|max:10',
    ]);

    // التعامل الصحيح مع الحقل 'is_published'
    $data['is_published'] = $request->boolean('is_published');

    // [مطلوب] - جلب المسلسل الجديد
    $newAnime = Anime::find($data['series_id']);
    
    // [مطلوب] - التحقق مما إذا كان المسلسل قد تغير
    $seriesChanged = $episode->series_id != $data['series_id'];

    // --- [مطلوب] - منطق تحديث الصور بناءً على طلبك ---

    // 1. منطق الصورة المصغرة (Thumbnail)
    if ($request->hasFile('thumbnail')) {
        // الحالة 1: المستخدم رفع صورة جديدة -> استخدمها
       if ($episode->thumbnail)// 
       //  Storage::disk('public')->delete($episode->thumbnail);
        $data['thumbnail'] = $request->file('thumbnail')->store('animes', 'public');
    } elseif ($seriesChanged) {
        // الحالة 2: المسلسل "تغير" ولم يرفع صورة -> استخدم صورة المسلسل "الجديد"
        $data['thumbnail'] = $newAnime->image ?? null;
    } else {
        // الحالة 3: المسلسل "لم يتغير" ولم يرفع صورة -> احتفظ بصورة الحلقة "القديمة"
        $data['thumbnail'] = $episode->thumbnail;
    }

    // 2. منطق البانر (Banner)
    if ($request->hasFile('banner')) {
        // الحالة 1: المستخدم رفع صورة جديدة -> استخدمها
        if ($episode->banner) 
           // Storage::disk('public')->delete($episode->banner);
        $data['banner'] = $request->file('banner')->store('animes', 'public');
    } elseif ($seriesChanged) {
        // الحالة 2: المسلسل "تغير" ولم يرفع صورة -> استخدم صورة المسلسل "الجديد"
        $data['banner'] = $newAnime->cover ?? null;
    } else {
        // الحالة 3: المسلسل "لم يتغير" ولم يرفع صورة -> احتفظ بصورة الحلقة "القديمة"
        $data['banner'] = $episode->banner;
    }

    // --- نهاية منطق تحديث الصور ---

    // تحديث بيانات الحلقة
    $episode->update($data);

    // تحديث روابط الفيديو (استخدام بيانات المسلسل الجديد)
    EpisodeVideo::where('episode_id', $episode->id)->delete();
    $videoUrls = $request->video_urls ?? [];
    foreach ($videoUrls as $url) {
        if (!empty($url)) {
            EpisodeVideo::create([
                'episode_id' => $episode->id,
                'video_url' => $url,
                'episode_number' => $request->episode_number,
                'anime_title' => $newAnime->title ?? '', // استخدام بيانات المسلسل الجديد
                'anime_image' => $newAnime->image ?? null, // استخدام بيانات المسلسل الجديد
            ]);
        }
    }

    return redirect()->route('episodes.index')->with('success', 'تم تحديث الحلقة بنجاح');
}
public function show(Episode $episode)
{
    // جلب الحلقة مع بيانات المسلسل وروابط الفيديو
    $episode = Episode::with(['series', 'videos'])->findOrFail($episode->id);

    $this->recordHistory($episode);

    return Inertia::render('Episodes/Details', [
        'episode' => $episode,
        'videos' => $episode->videos, // روابط الفيديو
        'series' => $episode->series, // بيانات المسلسل
    ]);
}

    /**
     * Record history for episode visit
     */
    private function recordHistory($episode)
    {
        if (auth()->check()) {
            \App\Models\History::updateOrCreate(
                [
                    'user_id' => auth()->id(),
                    'episode_id' => $episode->id,
                    'type' => 'view',
                ],
                [
                    'updated_at' => now(),
                ]
            );
        }
    }

    public function destroy(Episode $episode)
    {


        // حذف الملفات المرتبطة
        if ($episode->thumbnail) {
            Storage::disk('public')->delete($episode->thumbnail);
        }
        if ($episode->banner) {
            Storage::disk('public')->delete($episode->banner);
        }

        $deletedurl = DB::table('episode_videos')
        ->where('episode_id', $episode->id)
        ->delete();


        $episode->delete();
        return redirect()->back()->with('success', 'تم حذف الحلقة بنجاح');
    }


}
