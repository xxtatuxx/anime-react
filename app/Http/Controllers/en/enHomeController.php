<?php

namespace App\Http\Controllers\en;

use App\Models\Episode;
use App\Models\Anime;
use App\Models\News;
use App\Models\Category;
use App\Models\Season;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Inertia\Inertia;

class enHomeController extends Controller
{
    public function index(Request $request)
    {
        $search = $request->input('search');

        // ===== حلقات =====
        $query = Episode::with('series')->orderByDesc('id');

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('episode_number', $search)
                  ->orWhereHas('series', function ($seriesQuery) use ($search) {
                      $seriesQuery->where('title', 'LIKE', "%{$search}%");
                  });
            });
        }

        $episodes = $query->paginate(14);

        // ===== جميع الأنميات بدون فلترة نوع =====
        $animeQuery = Anime::query()->orderByDesc('id');

        if (!empty($search)) {
            $animeQuery->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('title_en', 'LIKE', "%{$search}%");
            });
        }

        $animes = $animeQuery->get();

        // ===== آخر الأخبار =====
        $news = News::orderByDesc('id')->take(5)->get(); // آخر 5 أخبار

        return Inertia::render('home-en/en-home', [
            'episodes' => $episodes,
            'animes'   => $animes,
            'news'     => $news,
            'filters'  => [
                'search' => $search,
            ],
        ]);
    }
public function anime(Request $request)
{
    // استعلام الأنميات مع المستخدمين والفئات والموسم ونوع TV فقط
    $query = Anime::with(['user', 'categories', 'season'])
        ->where('type', 'tv');

    // فلترة حسب الحالة
    if ($request->status) {
        if ($request->status === 'Active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'completed') {
            $query->where('is_active', false);
        }
    }

    // فلترة حسب الفئة
    if ($request->category) {
        $query->whereHas('categories', function($q) use ($request) {
            $q->where('name_en', $request->category);
        });
    }

    // فلترة حسب الموسم
    if ($request->season) {
        $query->where('seasons', $request->season);
    }

    // فلترة حسب البحث
    if ($request->search) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('slug', 'like', "%{$search}%")
              ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"))
              ->orWhereHas('categories', fn($q) => $q->where('name', 'like', "%{$search}%"))
              ->orWhereHas('season', fn($q) => $q->where('name', 'like', "%{$search}%"));
        });
    }

    // ترتيب وتحجيم الصفحة
    $animes = $query->latest()->simplePaginate(10);

    // جلب جميع الفئات لاستخدامها في فلترة الواجهة
    $categories = Category::orderBy('name')->get();

    // جلب جميع المواسم لاستخدامها في فلترة الواجهة
    $seasons = Season::orderBy('name')->get();

    return Inertia::render('home-en/en-anime', [
        'animes' => $animes,
        'categories' => $categories,
        'seasons' => $seasons,
    ]);
}

public function movies(Request $request)
{
    $query = Anime::with(['user', 'categories', 'season'])
        ->where('type', 'Movie');

    // فلترة حسب الحالة
    if ($request->status) {
        if ($request->status === 'Active') {
            $query->where('is_active', true);
        } elseif ($request->status === 'completed') {
            $query->where('is_active', false);
        }
    }

    // فلترة حسب الفئة
    if ($request->category) {
        $query->whereHas('categories', function($q) use ($request) {
            $q->where('name_en', $request->category);
        });
    }

    // فلترة حسب الموسم
    if ($request->season) {
        $query->whereHas('season', function($q) use ($request) {
            $q->where('id', $request->season);
        });
    }

    // فلترة حسب البحث
    if ($request->search) {
        $search = $request->search;
        $query->where(function($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('slug', 'like', "%{$search}%")
              ->orWhereHas('user', fn($q) => $q->where('name', 'like', "%{$search}%"))
              ->orWhereHas('categories', fn($q) => $q->where('name', 'like', "%{$search}%"))
              ->orWhereHas('season', fn($q) => $q->where('name', 'like', "%{$search}%"));
        });
    }

    $animes = $query->latest()->simplePaginate(10);

    $categories = Category::orderBy('name')->get();
    $seasons = Season::orderBy('name')->get();

    return Inertia::render('home-en/en-movies', [
        'animes' => $animes,
        'categories' => $categories,
        'seasons' => $seasons,
    ]);
}



public function Episodes(Request $request)
{
    $animeName = $request->input('anime_name'); // اسم الأنمي من المربع الأول
    $episodeNumber = $request->input('episode_number'); // رقم الحلقة من المربع الثاني

    $query = Episode::with('series')->latest();

    if (!empty($animeName)) {
        $query->whereHas('series', function ($q) use ($animeName) {
            $q->where('title', 'LIKE', "%{$animeName}%");
        });
    }

    if (!empty($episodeNumber)) {
        $query->where('episode_number', $episodeNumber);
    }

    $episodes = $query->paginate(15);

    return Inertia::render('home-en/en-Episodes', [
        'episodes' => $episodes,
        'animes' => \App\Models\Anime::all(['id','title','image']), // تمرير الأنميات للـ dropdown
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

    return Inertia::render('home-en/en-anime-show', [
        'anime' => $anime,
    ]);
}

}
