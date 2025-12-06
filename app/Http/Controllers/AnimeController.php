<?php

namespace App\Http\Controllers;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Http;
use App\Models\Anime;
use App\Models\Category;
use App\Models\Season;
use App\Models\Language;
use App\Models\Type;
use App\Models\Episode;

use App\Models\Studio;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class AnimeController extends Controller
{
public function index()
{
    $animes = Anime::with('user', 'categories')
        ->latest()
        ->simplePaginate(9); // استخدم simplePaginate للحصول على next_page_url فقط

    return Inertia::render('Animes/Index', [
        'animes' => $animes,
    ]);
}


public function create()
{
    $categories = Category::all();
    $seasons = Season::all(['id', 'name']);
    $languages = Language::all(['id', 'name_en']);
    $types = Type::all(['id', 'name_en']);
    $studios = Studio::all(['id', 'name_en']); // ✅ إضافة الاستوديوهات

    return Inertia::render('Animes/Create', [
        'categories' => $categories,
        'seasons' => $seasons,
        'languages' => $languages,
        'types' => $types,
        'studios' => $studios, // ✅ تمريرها إلى الواجهة
    ]);
}



public function show(Anime $anime)
{
    $anime->load([
        'user',
        'episodes' => function ($query) {
            $query->orderBy('episode_number', 'asc');
        },
        'categories',
        'season', // ✅ إضافة علاقة الموسم هنا
    ]);

    return Inertia::render('Animes/Details', [
        'anime' => $anime,
    ]);
}


public function store(Request $request)
{
  $data = $request->validate([
        'title' => [
            'required',
            'string',
            'max:255',
            Rule::unique('animes', 'title'), // ✅ بدون ignore()
        ],
        'title_en' => [
            'nullable',
            'string',
            'max:255',
            Rule::unique('animes', 'title_en'), // ✅ بدون ignore()
        ],
        'slug' => 'required|string|max:255|unique:animes,slug',
        'slug_en' => 'nullable|string|max:255|unique:animes,slug_en',
        'description' => 'nullable|string',
        'description_en' => 'nullable|string',
        'category_ids' => 'nullable|array',
        'category_ids.*' => 'exists:categories,id',
        'seasons' => 'nullable|integer|min:1',
        'status' => 'nullable|string|max:50',
        'release_date' => 'nullable|date',
        'rating' => 'nullable|numeric|min:0|max:10',
        'image' => 'nullable|file|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        'cover' => 'nullable|file|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
        'studio_id' => 'nullable|integer|exists:studios,id',
        'duration' => 'nullable|integer',
        'language_id' => 'nullable|integer|exists:languages,id',
        'type_id' => 'nullable|integer|exists:types,id',
        'trailer' => 'nullable|string|max:255',
        'is_active' => 'nullable|boolean',
    ]);

    // تحويل studio_id و type_id و language_id إلى أسماء نصية حسب الدولة/اللغة
    $data['studio_name'] = $data['studio_id'] ? Studio::find($data['studio_id'])->name_en : null;
    $data['type'] = $data['type_id'] ? Type::find($data['type_id'])->name_en : null;
    $data['language'] = $data['language_id'] ? Language::find($data['language_id'])->name_en : null;

    // إزالة الحقول غير الضرورية قبل الحفظ
    unset($data['studio_id'], $data['type_id'], $data['language_id']);

    if ($request->hasFile('image')) {
        $data['image'] = $request->file('image')->store('animes', 'public');
    }

    if ($request->hasFile('cover')) {
        $data['cover'] = $request->file('cover')->store('animes', 'public');
    }

    $data['is_active'] = $data['is_active'] ?? false;
    $data['user_id'] = auth()->id();

    $anime = Anime::create($data);

    // ربط التصنيفات
    if (!empty($data['category_ids'])) {
        $anime->categories()->sync($data['category_ids']);
    }

    return redirect()->route('animes.index')->with('success', 'تم إنشاء الأنمي بنجاح');
}


   public function edit(Anime $anime)
{
    $categories = Category::all();
    $types = Type::where('is_active', 1)->get();       // جلب أنواع الأنمي الفعالة
    $studios = Studio::where('is_active', 1)->get();   // جلب الاستوديوهات الفعالة
    $seasons = Season::all();                          // جلب كل السيزونات
    $languages = Language::all();                      // جلب كل اللغات

    $anime->load('categories');

    return Inertia::render('Animes/Edit', [
        'anime' => $anime,
        'categories' => $categories,
        'types' => $types,
        'studios' => $studios,
        'seasons' => $seasons,
        'languages' => $languages,
    ]);
}

public function update(Request $request, Anime $anime)
{
    // 1. التحقق من صحة البيانات
   $data = $request->validate([
    'title' => 'required|string|max:255',
    'title_en' => 'nullable|string|max:255',
    'slug' => [
        'required',
        'string',
        'max:255',
        // الشرط الذكي لتفادي التكرار فقط لو غُيّر السلوغ
        Rule::unique('animes', 'slug')->ignore($anime->id),
    ],
    'slug_en' => [
        'nullable',
        'string',
        'max:255',
        Rule::unique('animes', 'slug_en')->ignore($anime->id),
    ],
    'description' => 'nullable|string',
    'description_en' => 'nullable|string',
    'category_ids' => 'nullable|array',
    'category_ids.*' => 'exists:categories,id',
    'seasons' => 'nullable|integer|min:1',
    'status' => 'nullable|string|max:50',
    'release_date' => 'nullable|date',
    'rating' => 'nullable|numeric|min:0|max:10',
    'image' => 'nullable|file|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
    'cover' => 'nullable|file|image|mimes:jpg,jpeg,png,gif,webp|max:2048',
    'studio_name' => 'nullable|string|max:255',
    'duration' => 'nullable|integer',
    'language' => 'nullable|string|max:255',
    'trailer' => 'nullable|string|max:255',
    'type' => 'nullable|string|max:50',
    'is_active' => 'nullable|boolean',
]);

    // 2. معالجة الصورة الرئيسية
    if ($request->hasFile('image')) {
        if ($anime->image) {
            Storage::disk('public')->delete($anime->image);
        }
        $data['image'] = $request->file('image')->store('animes', 'public');
    } else {
        unset($data['image']); // تجاهل إذا لم يتم رفع صورة جديدة
    }

    // 3. معالجة صورة الغلاف
    if ($request->hasFile('cover')) {
        if ($anime->cover) {
            Storage::disk('public')->delete($anime->cover);
        }
        $data['cover'] = $request->file('cover')->store('animes', 'public');
    } else {
        unset($data['cover']); // تجاهل إذا لم يتم رفع غلاف جديد
    }

    // 4. تعيين حقول إضافية
    $data['is_active'] = $data['is_active'] ?? false;
    $data['user_id'] = auth()->id();

    // 5. تحديث الأنمي
    $anime->update($data);

    // 6. ربط التصنيفات
    $anime->categories()->sync($data['category_ids'] ?? []);

    return redirect()->route('animes.index')->with('success', 'تم تحديث الأنمي بنجاح');
}


    public function destroy(Anime $anime)
    {
        if ($anime->image) {
            Storage::disk('public')->delete($anime->image);
        }

        if ($anime->cover) {
            Storage::disk('public')->delete($anime->cover);
        }

        $anime->categories()->detach(); // فك الربط مع التصنيفات
        $anime->delete();

        return redirect()->back()->with('success', 'تم حذف الأنمي بنجاح');
    }

  /**
   * أحدث الأنميات - مع كاش دائم على السيرفر + كاش المتصفح
   */
  public function latestTvAnime()
    {
        try {
            // ✅ كاش دائم على السيرفر
            $data = \Illuminate\Support\Facades\Cache::rememberForever('cache:latest:tv:anime', function () {
                return [
                    'latest_tv' => Anime::where('type', 'tv')
                        ->where('is_active', 1)
                        ->latest()
                        ->first(),
                    'latest_movie' => Anime::where('type', 'Movie')
                        ->where('is_active', 1)
                        ->latest()
                        ->first(),
                    'latest_episode' => Episode::where('is_published', 1)
                        ->latest('release_date')
                        ->first(),
                ];
            });

            // ✅ كاش المتصفح - 10 دقائق
            return response()->json($data)
                ->header('Cache-Control', 'public, max-age=600')
                ->header('ETag', md5(json_encode($data)));
                
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch latest anime data',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * مسح كاش أحدث الأنميات (يُستدعى عند إضافة/تعديل أنمي أو حلقة)
     */
    public static function clearLatestTvAnimeCache(): void
    {
        \Illuminate\Support\Facades\Cache::forget('cache:latest:tv:anime');
    }



}
