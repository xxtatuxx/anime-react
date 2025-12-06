<?php

namespace App\Http\Controllers\Home;

use App\Models\Episode;
use App\Models\Anime;
use App\Models\News;
use App\Models\Category;
use App\Models\Season;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

use Inertia\Inertia;

class HomeController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | نظام الكاش الشامل - Cache Keys Reference
    |--------------------------------------------------------------------------
    |
    | الحلقات:
    |   - cache:home:episodes:page:{N}          → الحلقات مع التصفح
    |   - cache:api:episodes:page:{N}           → API الحلقات
    |   - cache:episodes:list:page:{N}          → صفحة الحلقات
    |
    | الأنميات:
    |   - cache:home:animes:all                 → جميع الأنميات للصفحة الرئيسية
    |   - cache:anime:tv:page:{N}               → أنميات TV مع التصفح
    |   - cache:anime:show:{ID}                 → تفاصيل أنمي معين
    |   - cache:anime:dropdown                  → قائمة الأنميات للـ dropdown
    |
    | الأفلام:
    |   - cache:movies:page:{N}                 → الأفلام مع التصفح
    |
    | الأخبار:
    |   - cache:news:latest                     → آخر الأخبار
    |
    | البيانات الثابتة:
    |   - cache:categories:all                  → جميع الفئات
    |   - cache:seasons:all                     → جميع المواسم
    |
    */

    // =====================================================
    // ثوابت الكاش
    // =====================================================
    
    /** كاش دائم - يبقى حتى يتم مسحه يدوياً */
    private const CACHE_FOREVER = null;
    
    /** عدد الصفحات للكاش */
    private const MAX_CACHED_PAGES = 100;

    // =====================================================
    // مفاتيح الكاش
    // =====================================================

    private static function cacheKey(string $type, ...$params): string
    {
        $key = "cache:{$type}";
        foreach ($params as $param) {
            $key .= ":{$param}";
        }
        return $key;
    }

    // =====================================================
    // الصفحة الرئيسية
    // =====================================================

    public function index(Request $request)
    {
        $search = $request->input('search');

        // إذا كان هناك بحث، لا نستخدم الكاش
        if (!empty($search)) {
            return $this->getHomeDataWithSearch($search);
        }

        // ✅ الحلقات - كاش دائم
        $episodes = Cache::rememberForever(
            self::cacheKey('home', 'episodes', 'page', 1),
            fn() => Episode::with('series')->orderByDesc('id')->paginate(14)
        );

        // ✅ جميع الأنميات - كاش دائم
        $animes = Cache::rememberForever(
            self::cacheKey('home', 'animes', 'all'),
            fn() => Anime::query()->orderByDesc('id')->get()
        );

        // ✅ آخر الأخبار - كاش دائم
        $news = Cache::rememberForever(
            self::cacheKey('news', 'latest'),
            fn() => News::orderByDesc('id')->take(5)->get()
        );

        return Inertia::render('home/ar-home', [
            'episodes' => $episodes,
            'animes'   => $animes,
            'news'     => $news,
            'filters'  => ['search' => $search],
        ]);
    }

    /**
     * البيانات مع البحث (بدون كاش - البحث ديناميكي)
     */
    private function getHomeDataWithSearch($search)
    {
        $query = Episode::with('series')->orderByDesc('id');
        $query->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', "%{$search}%")
              ->orWhere('episode_number', $search)
              ->orWhereHas('series', fn($sq) => $sq->where('title', 'LIKE', "%{$search}%"));
        });
        $episodes = $query->paginate(14);

        $animeQuery = Anime::query()->orderByDesc('id');
        $animeQuery->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', "%{$search}%")
              ->orWhere('title_en', 'LIKE', "%{$search}%");
        });
        $animes = $animeQuery->get();

        // الأخبار من الكاش
        $news = Cache::rememberForever(
            self::cacheKey('news', 'latest'),
            fn() => News::orderByDesc('id')->take(5)->get()
        );

        return Inertia::render('home/ar-home', [
            'episodes' => $episodes,
            'animes'   => $animes,
            'news'     => $news,
            'filters'  => ['search' => $search],
        ]);
    }

    // =====================================================
    // API الحلقات (للـ Vue frontend)
    // =====================================================

    public function apiEpisodes(Request $request)
    {
        $search = $request->input('search');
        $page = (int) $request->input('page', 1);

        // إذا كان هناك بحث، لا نستخدم الكاش
        if (!empty($search)) {
            return $this->getEpisodesWithSearch($search, $page);
        }

        // ✅ كاش دائم لكل صفحة
        return Cache::rememberForever(
            self::cacheKey('api', 'episodes', 'page', $page),
            fn() => Episode::with('series')
                ->orderByDesc('id')
                ->paginate(14, ['*'], 'page', $page)
        );
    }

    private function getEpisodesWithSearch($search, $page)
    {
        $query = Episode::with('series')->orderByDesc('id');
        $query->where(function ($q) use ($search) {
            $q->where('title', 'LIKE', "%{$search}%")
              ->orWhere('episode_number', $search)
              ->orWhereHas('series', fn($sq) => $sq->where('title', 'LIKE', "%{$search}%"));
        });
        return $query->paginate(14, ['*'], 'page', $page);
    }

    // =====================================================
    // صفحة الأنمي (TV)
    // =====================================================

    public function anime(Request $request)
    {
        $hasFilters = $request->status || $request->category || $request->season || $request->search;

        if ($hasFilters) {
            return $this->getAnimeWithFilters($request);
        }

        // ✅ أنميات TV - كاش دائم
        $animes = Cache::rememberForever(
            self::cacheKey('anime', 'tv', 'page', 1),
            fn() => Anime::with(['user', 'categories', 'season'])
                ->where('type', 'tv')
                ->latest()
                ->simplePaginate(10)
        );

        // ✅ الفئات - كاش دائم
        $categories = Cache::rememberForever(
            self::cacheKey('categories', 'all'),
            fn() => Category::orderBy('name')->get()
        );

        // ✅ المواسم - كاش دائم
        $seasons = Cache::rememberForever(
            self::cacheKey('seasons', 'all'),
            fn() => Season::orderBy('name')->get()
        );

        return Inertia::render('home/ar-anime', [
            'animes' => $animes,
            'categories' => $categories,
            'seasons' => $seasons,
        ]);
    }

    private function getAnimeWithFilters(Request $request)
    {
        $query = Anime::with(['user', 'categories', 'season'])->where('type', 'tv');

        if ($request->status) {
            $query->where('is_active', $request->status === 'Active');
        }

        if ($request->category) {
            $query->whereHas('categories', fn($q) => $q->where('name', $request->category));
        }

        if ($request->season) {
            $query->where('seasons', $request->season);
        }

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

        $categories = Cache::rememberForever(
            self::cacheKey('categories', 'all'),
            fn() => Category::orderBy('name')->get()
        );

        $seasons = Cache::rememberForever(
            self::cacheKey('seasons', 'all'),
            fn() => Season::orderBy('name')->get()
        );

        return Inertia::render('home/ar-anime', [
            'animes' => $animes,
            'categories' => $categories,
            'seasons' => $seasons,
        ]);
    }

    // =====================================================
    // صفحة الأفلام
    // =====================================================

    public function movies(Request $request)
    {
        $hasFilters = $request->status || $request->category || $request->season || $request->search;

        if ($hasFilters) {
            return $this->getMoviesWithFilters($request);
        }

        // ✅ الأفلام - كاش دائم
        $animes = Cache::rememberForever(
            self::cacheKey('movies', 'page', 1),
            fn() => Anime::with(['user', 'categories', 'season'])
                ->where('type', 'Movie')
                ->latest()
                ->simplePaginate(10)
        );

        $categories = Cache::rememberForever(
            self::cacheKey('categories', 'all'),
            fn() => Category::orderBy('name')->get()
        );

        $seasons = Cache::rememberForever(
            self::cacheKey('seasons', 'all'),
            fn() => Season::orderBy('name')->get()
        );

        return Inertia::render('home/ar-movies', [
            'animes' => $animes,
            'categories' => $categories,
            'seasons' => $seasons,
        ]);
    }

    private function getMoviesWithFilters(Request $request)
    {
        $query = Anime::with(['user', 'categories', 'season'])->where('type', 'Movie');

        if ($request->status) {
            $query->where('is_active', $request->status === 'Active');
        }

        if ($request->category) {
            $query->whereHas('categories', fn($q) => $q->where('name', $request->category));
        }

        if ($request->season) {
            $query->whereHas('season', fn($q) => $q->where('id', $request->season));
        }

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

        $categories = Cache::rememberForever(
            self::cacheKey('categories', 'all'),
            fn() => Category::orderBy('name')->get()
        );

        $seasons = Cache::rememberForever(
            self::cacheKey('seasons', 'all'),
            fn() => Season::orderBy('name')->get()
        );

        return Inertia::render('home/ar-movies', [
            'animes' => $animes,
            'categories' => $categories,
            'seasons' => $seasons,
        ]);
    }

    // =====================================================
    // صفحة الحلقات
    // =====================================================

    public function Episodes(Request $request)
    {
        $animeName = $request->input('anime_name');
        $episodeNumber = $request->input('episode_number');
        $hasFilters = !empty($animeName) || !empty($episodeNumber);

        if ($hasFilters) {
            $query = Episode::with('series')->latest();

            if (!empty($animeName)) {
                $query->whereHas('series', fn($q) => $q->where('title', 'LIKE', "%{$animeName}%"));
            }

            if (!empty($episodeNumber)) {
                $query->where('episode_number', $episodeNumber);
            }

            $episodes = $query->paginate(15);
        } else {
            // ✅ كاش دائم
            $episodes = Cache::rememberForever(
                self::cacheKey('episodes', 'list', 'page', 1),
                fn() => Episode::with('series')->latest()->paginate(15)
            );
        }

        // ✅ قائمة الأنميات للـ dropdown - كاش دائم
        $animes = Cache::rememberForever(
            self::cacheKey('anime', 'dropdown'),
            fn() => Anime::all(['id', 'title', 'image'])
        );

        return Inertia::render('home/ar-Episodes', [
            'episodes' => $episodes,
            'animes' => $animes,
        ]);
    }

    // =====================================================
    // عرض تفاصيل الأنمي
    // =====================================================

    public function show(Anime $anime)
    {
        // ✅ كاش دائم لكل أنمي
        $cachedAnime = Cache::rememberForever(
            self::cacheKey('anime', 'show', $anime->id),
            function () use ($anime) {
                $anime->load([
                    'user',
                    'episodes' => fn($q) => $q->orderBy('episode_number', 'asc'),
                    'categories',
                    'season',
                ]);
                return $anime;
            }
        );

        return Inertia::render('home/ar-anime-show', [
            'anime' => $cachedAnime,
        ]);
    }

    // =====================================================
    // ⚡ دوال مسح وتحديث الكاش
    // =====================================================

    /**
     * مسح كاش الحلقات (عند إضافة/تعديل/حذف حلقة)
     */
    public static function clearEpisodesCache(): void
    {
        // مسح كاش الصفحة الرئيسية
        for ($i = 1; $i <= self::MAX_CACHED_PAGES; $i++) {
            Cache::forget(self::cacheKey('home', 'episodes', 'page', $i));
            Cache::forget(self::cacheKey('api', 'episodes', 'page', $i));
            Cache::forget(self::cacheKey('episodes', 'list', 'page', $i));
        }
    }

    /**
     * مسح كاش الأنميات (عند إضافة/تعديل/حذف أنمي)
     */
    public static function clearAnimesCache(): void
    {
        Cache::forget(self::cacheKey('home', 'animes', 'all'));
        Cache::forget(self::cacheKey('anime', 'dropdown'));
        
        for ($i = 1; $i <= self::MAX_CACHED_PAGES; $i++) {
            Cache::forget(self::cacheKey('anime', 'tv', 'page', $i));
            Cache::forget(self::cacheKey('movies', 'page', $i));
        }
    }

    /**
     * مسح كاش أنمي معين (عند تعديل أنمي)
     */
    public static function clearAnimeShowCache(int $animeId): void
    {
        Cache::forget(self::cacheKey('anime', 'show', $animeId));
    }

    /**
     * مسح كاش الأخبار
     */
    public static function clearNewsCache(): void
    {
        Cache::forget(self::cacheKey('news', 'latest'));
    }

    /**
     * مسح كاش الفئات
     */
    public static function clearCategoriesCache(): void
    {
        Cache::forget(self::cacheKey('categories', 'all'));
    }

    /**
     * مسح كاش المواسم
     */
    public static function clearSeasonsCache(): void
    {
        Cache::forget(self::cacheKey('seasons', 'all'));
    }

    /**
     * مسح جميع الكاش (عند الحاجة لإعادة تحميل كل شيء)
     */
    public static function clearAllCache(): void
    {
        self::clearEpisodesCache();
        self::clearAnimesCache();
        self::clearNewsCache();
        self::clearCategoriesCache();
        self::clearSeasonsCache();
    }

    // =====================================================
    // 🔄 دوال لتحديث الكاش (للاستخدام في Model Observers)
    // =====================================================

    /**
     * تحديث كاش الحلقات مباشرة
     */
    public static function refreshEpisodesCache(): void
    {
        self::clearEpisodesCache();
        
        // إعادة بناء الكاش للصفحة الأولى فوراً
        Cache::rememberForever(
            self::cacheKey('home', 'episodes', 'page', 1),
            fn() => Episode::with('series')->orderByDesc('id')->paginate(14)
        );
        
        Cache::rememberForever(
            self::cacheKey('api', 'episodes', 'page', 1),
            fn() => Episode::with('series')->orderByDesc('id')->paginate(14)
        );
    }

    /**
     * تحديث كاش الأنميات مباشرة
     */
    public static function refreshAnimesCache(): void
    {
        self::clearAnimesCache();
        
        Cache::rememberForever(
            self::cacheKey('home', 'animes', 'all'),
            fn() => Anime::query()->orderByDesc('id')->get()
        );
        
        Cache::rememberForever(
            self::cacheKey('anime', 'dropdown'),
            fn() => Anime::all(['id', 'title', 'image'])
        );
    }
}
