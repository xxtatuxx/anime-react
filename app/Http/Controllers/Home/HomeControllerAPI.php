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

class HomeControllerAPI extends Controller
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
    // ⚡ React API - Episode Show
    // =====================================================

    /**
     * API for Episode Show (React)
     */
    public function apiEpisodeShow(Episode $episode)
    {
        // Load episode with series
        $episode->load(['series', 'videos']);

        // Record History for view (same as Laravel version)
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

        // Get series episodes for sidebar
        $seriesEpisodes = Episode::where('series_id', $episode->series_id)
            ->orderBy('episode_number', 'asc')
            ->select('id', 'title', 'episode_number', 'thumbnail', 'duration', 'series_id')
            ->paginate(50);

        // Get latest episodes (for "More Episodes" section)
        $latestEpisodes = Episode::with('series')
            ->where('id', '!=', $episode->id)
            ->orderByDesc('id')
            ->take(10)
            ->get();

        // Get comments for this episode
        $comments = \App\Models\Comment::where('episode_id', $episode->id)
            ->with(['user', 'likes', 'replies.user', 'replies.likes'])
            ->whereNull('parent_id')
            ->orderByDesc('created_at')
            ->get();

        // Transform comments for React frontend
        $userId = auth()->id();
        $transformedComments = $comments->map(function ($comment) use ($userId) {
            return $this->transformComment($comment, $userId);
        });

        return response()->json([
            'episode' => $episode,
            'series' => $episode->series,
            'videos' => $episode->videos ?? [],
            'seriesEpisodes' => $seriesEpisodes,
            'latestEpisodes' => $latestEpisodes,
            'comments' => $transformedComments,
        ]);
    }

    /**
     * Transform comment for React frontend (convert likes array to counts)
     */
    private function transformComment($comment, $userId)
    {
        $likes = $comment->likes ?? collect();
        $likesCount = $likes->where('is_like', true)->count();
        $dislikesCount = $likes->where('is_like', false)->count();
        
        $userInteraction = null;
        if ($userId) {
            $userLike = $likes->where('user_id', $userId)->first();
            if ($userLike) {
                $userInteraction = $userLike->is_like;
            }
        }

        $replies = [];
        if ($comment->replies) {
            $replies = $comment->replies->map(function ($reply) use ($userId) {
                return $this->transformComment($reply, $userId);
            });
        }

        return [
            'id' => $comment->id,
            'content' => $comment->content,
            'user' => $comment->user ? [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'avatar' => $comment->user->avatar,
            ] : null,
            'user_id' => $comment->user_id,
            'created_at' => $comment->created_at,
            'likes' => $likesCount,
            'dislikes' => $dislikesCount,
            'user_interaction' => $userInteraction,
            'replies' => $replies,
        ];
    }

    // =====================================================
    // ⚡ React API - Comments
    // =====================================================

    /**
     * Add a new comment
     */
    public function apiAddComment(Request $request)
    {
        $request->validate([
            'episode_id' => 'required|exists:episodes,id',
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $comment = \App\Models\Comment::create([
            'user_id' => $user->id,
            'episode_id' => $request->episode_id,
            'parent_id' => $request->parent_id,
            'content' => $request->content,
        ]);

        $comment->load('user');

        // ===== Notification for Reply =====
        if ($request->parent_id) {
            $parentComment = \App\Models\Comment::with('user')->find($request->parent_id);
            if ($parentComment && $parentComment->user_id !== $user->id) {
                $parentComment->user->notify(new \App\Notifications\NewReplyNotification($parentComment, $comment));
            }
        }

        // ===== Record History (same as Laravel) =====
        $historyMetadata = [
            'comment_id' => $comment->id,
            'content' => \Illuminate\Support\Str::limit($comment->content, 100),
        ];

        if ($request->parent_id) {
            $parentComment = \App\Models\Comment::with('user')->find($request->parent_id);
            $historyMetadata['replied_to_user'] = $parentComment?->user?->name ?? 'مستخدم';
            $historyMetadata['replied_to_content'] = \Illuminate\Support\Str::limit($parentComment?->content ?? '', 50);
        }

        \App\Models\History::create([
            'user_id' => $user->id,
            'episode_id' => $request->episode_id,
            'type' => $request->parent_id ? 'reply' : 'comment',
            'metadata' => $historyMetadata,
        ]);

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => [
                'id' => $comment->id,
                'content' => $comment->content,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'avatar' => $user->avatar,
                ],
                'user_id' => $user->id,
                'created_at' => $comment->created_at,
                'likes' => 0,
                'dislikes' => 0,
                'replies' => [],
            ],
        ]);
    }

    /**
     * Like/Dislike a comment
     */
    public function apiLikeComment(Request $request, \App\Models\Comment $comment)
    {
        $request->validate([
            'is_like' => 'required|boolean',
        ]);

        $user = auth()->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $isLike = $request->is_like;

        // Check existing like
        $existingLike = \App\Models\Like::where('user_id', $user->id)
            ->where('likeable_id', $comment->id)
            ->where('likeable_type', \App\Models\Comment::class)
            ->first();

        $shouldNotify = false;

        if ($existingLike) {
            if ($existingLike->is_like === $isLike) {
                // Remove like/dislike
                $existingLike->delete();
            } else {
                // Change from like to dislike or vice versa
                $existingLike->update(['is_like' => $isLike]);
                $shouldNotify = true;
            }
        } else {
            // Create new like
            \App\Models\Like::create([
                'user_id' => $user->id,
                'likeable_id' => $comment->id,
                'likeable_type' => \App\Models\Comment::class,
                'is_like' => $isLike,
            ]);
            $shouldNotify = true;

            // ===== Record Like History (same as Laravel) =====
            if ($isLike) {
                \App\Models\History::create([
                    'user_id' => $user->id,
                    'episode_id' => $comment->episode_id,
                    'type' => 'like',
                    'metadata' => [
                        'comment_id' => $comment->id,
                        'comment_content' => \Illuminate\Support\Str::limit($comment->content, 100),
                        'comment_owner' => $comment->user?->name ?? 'مستخدم',
                    ]
                ]);
            }
        }

        // ===== Send Notification (same as Laravel) =====
        if ($shouldNotify && $comment->user_id !== $user->id) {
            $comment->load('user');
            $comment->user->notify(new \App\Notifications\CommentInteractionNotification($comment, $user, $isLike));
        }

        return response()->json(['message' => 'Success']);
    }

    /**
     * Edit a comment
     */
    public function apiEditComment(Request $request, \App\Models\Comment $comment)
    {
        $user = auth()->user();
        if (!$user || $user->id !== $comment->user_id) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update(['content' => $request->content]);

        return response()->json(['message' => 'Comment updated successfully']);
    }

    /**
     * Delete a comment
     */
    public function apiDeleteComment(\App\Models\Comment $comment)
    {
        $user = auth()->user();
        if (!$user || $user->id !== $comment->user_id) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
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

    // =====================================================
    // 🔌 React API Endpoints (JSON Responses)
    // =====================================================

    /**
     * API: Home page data for React
     */
    public function apiHome(Request $request)
    {
        $search = $request->input('search');

        if (!empty($search)) {
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
        } else {
            $episodes = Cache::rememberForever(
                self::cacheKey('home', 'episodes', 'page', 1),
                fn() => Episode::with('series')->orderByDesc('id')->paginate(14)
            );

            $animes = Cache::rememberForever(
                self::cacheKey('home', 'animes', 'all'),
                fn() => Anime::query()->orderByDesc('id')->get()
            );
        }

        $news = Cache::rememberForever(
            self::cacheKey('news', 'latest'),
            fn() => News::orderByDesc('id')->take(5)->get()
        );

        // Transform episodes to include 'image' field for mobile compatibility
        $episodesData = $episodes->through(function ($episode) {
            $episode->image = $episode->thumbnail ?? $episode->banner;
            return $episode;
        });

        // Transform animes to include 'poster_image' and 'cover_image' for mobile
        $animesData = $animes->map(function ($anime) {
            $anime->poster_image = $anime->image;
            $anime->cover_image = $anime->cover;
            return $anime;
        });

        return response()->json([
            'episodes' => $episodesData,
            'animes'   => $animesData,
            'news'     => $news,
            'filters'  => ['search' => $search],
        ]);
    }

    /**
     * API: All Episodes for React
     */
    public function apiAllEpisodes(Request $request)
    {
        $search = $request->input('search');
        $page = (int) $request->input('page', 1);

        if (!empty($search)) {
            $query = Episode::with('series')->orderByDesc('id');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('episode_number', $search)
                  ->orWhereHas('series', fn($sq) => $sq->where('title', 'LIKE', "%{$search}%"));
            });
            $episodes = $query->paginate(15, ['*'], 'page', $page);
            // Transform episodes to add 'image' field
            $episodes->through(fn($ep) => tap($ep, fn($e) => $e->image = $e->thumbnail ?? $e->banner));
            return response()->json($episodes);
        }

        $episodes = Cache::rememberForever(
            self::cacheKey('episodes', 'list', 'page', $page),
            fn() => Episode::with('series')->latest()->paginate(15, ['*'], 'page', $page)
        );

        // Transform episodes to add 'image' field
        $episodes->through(fn($ep) => tap($ep, fn($e) => $e->image = $e->thumbnail ?? $e->banner));
        return response()->json($episodes);
    }

    /**
     * API: Anime list for React
     */
    public function apiAnime(Request $request)
    {
        $hasFilters = $request->status || $request->category || $request->season || $request->search;

        if ($hasFilters) {
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
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            $animes = $query->latest()->simplePaginate(10);
        } else {
            $animes = Cache::rememberForever(
                self::cacheKey('anime', 'tv', 'page', 1),
                fn() => Anime::with(['user', 'categories', 'season'])
                    ->where('type', 'tv')
                    ->latest()
                    ->simplePaginate(10)
            );
        }

        $categories = Cache::rememberForever(
            self::cacheKey('categories', 'all'),
            fn() => Category::orderBy('name')->get()
        );

        $seasons = Cache::rememberForever(
            self::cacheKey('seasons', 'all'),
            fn() => Season::orderBy('name')->get()
        );

        // Transform animes to add poster_image and cover_image
        $animes->through(fn($a) => tap($a, function($anime) {
            $anime->poster_image = $anime->image;
            $anime->cover_image = $anime->cover;
        }));

        return response()->json([
            'animes' => $animes,
            'categories' => $categories,
            'seasons' => $seasons,
        ]);
    }

    /**
     * API: Movies list for React
     */
    public function apiMovies(Request $request)
    {
        $hasFilters = $request->status || $request->category || $request->season || $request->search;

        if ($hasFilters) {
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
                      ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            $animes = $query->latest()->simplePaginate(10);
        } else {
            $animes = Cache::rememberForever(
                self::cacheKey('movies', 'page', 1),
                fn() => Anime::with(['user', 'categories', 'season'])
                    ->where('type', 'Movie')
                    ->latest()
                    ->simplePaginate(10)
            );
        }

        $categories = Cache::rememberForever(
            self::cacheKey('categories', 'all'),
            fn() => Category::orderBy('name')->get()
        );

        $seasons = Cache::rememberForever(
            self::cacheKey('seasons', 'all'),
            fn() => Season::orderBy('name')->get()
        );

        // Transform animes (movies) to add poster_image and cover_image
        $animes->through(fn($a) => tap($a, function($anime) {
            $anime->poster_image = $anime->image;
            $anime->cover_image = $anime->cover;
        }));

        return response()->json([
            'animes' => $animes,
            'categories' => $categories,
            'seasons' => $seasons,
        ]);
    }

    /**
     * API: Single anime details for React
     */
    public function apiAnimeShow(Anime $anime)
    {
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

        // Transform anime to add mobile fields
        $cachedAnime->poster_image = $cachedAnime->image;
        $cachedAnime->cover_image = $cachedAnime->cover;
        // Transform episodes
        if ($cachedAnime->episodes) {
            $cachedAnime->episodes->each(fn($ep) => $ep->image = $ep->thumbnail ?? $ep->banner);
        }

        return response()->json([
            'anime' => $cachedAnime,
        ]);
    }

    // =====================================================
    // 🔐 React Auth API Endpoints
    // =====================================================

    /**
     * API: Login for React
     */
    public function apiLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (auth()->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            
            return response()->json([
                'success' => true,
                'user' => auth()->user(),
                'message' => 'تم تسجيل الدخول بنجاح',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        ], 401);
    }

    /**
     * API: Register for React
     */
    public function apiRegister(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
        ]);

        auth()->login($user);

        return response()->json([
            'success' => true,
            'user' => $user,
            'message' => 'تم إنشاء الحساب بنجاح',
        ]);
    }

    /**
     * API: Logout for React
     */
    public function apiLogout(Request $request)
    {
        auth()->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'تم تسجيل الخروج',
        ]);
    }

    /**
     * API: Get current user for React
     */
    public function apiUser(Request $request)
    {
        if (auth()->check()) {
            return response()->json([
                'authenticated' => true,
                'user' => auth()->user(),
            ]);
        }

        return response()->json([
            'authenticated' => false,
            'user' => null,
        ]);
    }

    // =====================================================
    // 📳 React User Features API
    // =====================================================

    /**
     * API: Get notifications for React
     */
    public function apiNotifications(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $page = $request->input('page', 1);
        $notifications = auth()->user()
            ->notifications()
            ->orderByDesc('created_at')
            ->paginate(20, ['*'], 'page', $page);

        $unreadCount = auth()->user()->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * API: Mark notifications as read for React
     */
    public function apiMarkNotificationsRead(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        auth()->user()->unreadNotifications->markAsRead();

        return response()->json(['success' => true]);
    }

    /**
     * API: Get watch later list for React
     */
    public function apiWatchLater(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $page = $request->input('page', 1);
        $watchLater = \App\Models\WatchLater::where('user_id', auth()->id())
            ->with(['episode.series'])
            ->orderByDesc('created_at')
            ->paginate(20, ['*'], 'page', $page);

        $items = $watchLater->getCollection()->map(function ($item) {
            return [
                'id' => $item->episode->id,
                'episode_number' => $item->episode->episode_number,
                'title' => $item->episode->title,
                'series_title' => $item->episode->series->title ?? 'Unknown',
                'image' => $item->episode->thumbnail 
                    ? (str_starts_with($item->episode->thumbnail, 'http') 
                        ? $item->episode->thumbnail 
                        : "/storage/{$item->episode->thumbnail}")
                    : null,
                'added_at' => $item->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'data' => $items,
            'current_page' => $watchLater->currentPage(),
            'last_page' => $watchLater->lastPage(),
        ]);
    }

    /**
     * API: Add to watch later for React
     */
    public function apiAddWatchLater(Request $request, $episodeId)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        \App\Models\WatchLater::firstOrCreate([
            'user_id' => auth()->id(),
            'episode_id' => $episodeId,
        ]);

        return response()->json(['success' => true, 'message' => 'تمت الإضافة للمشاهدة لاحقاً']);
    }

    /**
     * API: Remove from watch later for React
     */
    public function apiRemoveWatchLater(Request $request, $episodeId)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        \App\Models\WatchLater::where('user_id', auth()->id())
            ->where('episode_id', $episodeId)
            ->delete();

        return response()->json(['success' => true]);
    }

    /**
     * API: Get watch history for React
     */
    public function apiHistory(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $page = $request->input('page', 1);
        $history = \App\Models\History::where('user_id', auth()->id())
            ->with(['episode.series'])
            ->orderByDesc('created_at')
            ->paginate(20, ['*'], 'page', $page);

        $items = $history->getCollection()->map(function ($item) {
            return [
                'id' => $item->id,
                'episode_id' => $item->episode->id ?? null,
                'episode_number' => $item->episode->episode_number ?? null,
                'series_title' => $item->episode->series->title ?? 'Unknown',
                'image' => $item->episode->thumbnail 
                    ? (str_starts_with($item->episode->thumbnail, 'http') 
                        ? $item->episode->thumbnail 
                        : "/storage/{$item->episode->thumbnail}")
                    : null,
                'type' => $item->type ?? 'watch',
                'metadata' => $item->metadata ?? null,
                'created_at' => $item->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'data' => $items,
            'current_page' => $history->currentPage(),
            'last_page' => $history->lastPage(),
        ]);
    }

    /**
     * API: Record activity (watch, comment, like, reply) for React
     */
    public function apiRecordActivity(Request $request)
    {
        if (!auth()->check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'episode_id' => 'required|exists:episodes,id',
            'type' => 'required|in:watch,comment,like,reply',
            'metadata' => 'nullable|array',
        ]);

        // Check if same activity already exists in last 5 minutes (prevent duplicates)
        $existingActivity = \App\Models\History::where('user_id', auth()->id())
            ->where('episode_id', $validated['episode_id'])
            ->where('type', $validated['type'])
            ->where('created_at', '>=', now()->subMinutes(5))
            ->first();

        if ($existingActivity) {
            // Update existing activity
            $existingActivity->update([
                'metadata' => $validated['metadata'] ?? $existingActivity->metadata,
                'updated_at' => now(),
            ]);
            return response()->json(['success' => true, 'message' => 'Activity updated']);
        }

        // Create new activity
        \App\Models\History::create([
            'user_id' => auth()->id(),
            'episode_id' => $validated['episode_id'],
            'type' => $validated['type'],
            'metadata' => $validated['metadata'] ?? null,
        ]);

        return response()->json(['success' => true, 'message' => 'Activity recorded']);
    }
}

