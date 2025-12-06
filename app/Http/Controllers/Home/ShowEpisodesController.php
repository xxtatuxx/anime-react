<?php

namespace App\Http\Controllers\Home;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Episode;
use App\Models\Anime;
use App\Models\EpisodeVideo;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class ShowEpisodesController extends Controller
{
public function show(Episode $episode)
{
    // 1. جلب الحلقة الحالية
    $episode = Episode::with(['series', 'videos'])->findOrFail($episode->id);

    // Record History
    \App\Services\HistoryService::record($episode->id, 'view');

    // Record history for episode visit
    $this->recordHistory($episode);

    // 2. جلب كل حلقات هذا الأنمي (للشريط الجانبي العلوي) - مبدئياً أول 20 حلقة
    $initialSeriesEpisodes = Episode::where('series_id', $episode->series_id)
        ->orderBy('episode_number', 'asc')
        ->paginate(20);

    // 3. جلب آخر الحلقات المضافة في الموقع ككل (للجزء السفلي من الشريط)
    // نستخدم with('series') لنعرض اسم الأنمي وصورته
        $latestEpisodes = Episode::with('series')
        ->orderBy('id', 'desc')
        ->limit(15) // نجلب أول 15 حلقة كبداية
        ->get();

    $userId = auth()->id();

    // Define recursive function for formatting comments
    $formatComment = function ($comment) use (&$formatComment, $userId) {
        return [
            'id' => $comment->id,
            'user' => $comment->user ? $comment->user->name : 'Unknown',
            'user_avatar' => $comment->user ? $comment->user->avatar : null,
            'user_id' => $comment->user_id, // Needed for edit/delete permission
            'date' => $comment->created_at->diffForHumans(),
            'content' => $comment->content,
            'likes' => $comment->likes->where('is_like', true)->count(),
            'dislikes' => $comment->likes->where('is_like', false)->count(),
            'user_interaction' => $comment->likes->where('user_id', $userId)->first()?->is_like, // true (like), false (dislike), or null
            'children' => $comment->children->map($formatComment),
        ];
    };

    $comments = $episode->comments()
        ->whereNull('parent_id') // Get only top-level comments
        ->with(['user', 'children.user', 'children.likes', 'likes']) // Eager load for performance (depth limitation might be needed for very deep trees)
        ->withCount(['likes as likes_count' => function ($query) {
            $query->where('is_like', true);
        }])
        ->latest()
        ->get();
    
    // Note: For true infinite nesting with eager loading, a custom approach or package is often better. 
    // For now, we'll rely on Laravel's lazy loading for deeper levels if not explicitly included, 
    // or we can use a package like staudenmeir/laravel-adjacency-list for optimized CTE queries.
    // Given the context, we will load a reasonable depth or rely on lazy loading for now.
    // To avoid N+1 for deep nesting, we can use a recursive relationship in the model or load a specific depth.
    // Let's stick to a simple recursive map for now, assuming reasonable depth.
    
    // Actually, to ensure we get children recursively without N+1, we should use `with('children')` recursively.
    // Laravel doesn't support `with('children.children...')` infinitely easily without a package.
    // We will load 5 levels deep for now as a practical limit for eager loading.
    $comments = $episode->comments()
        ->whereNull('parent_id')
        ->with([
            'user', 
            'likes',
            'children.user', 'children.likes',
            'children.children.user', 'children.children.likes',
            'children.children.children.user', 'children.children.children.likes',
            'children.children.children.children.user', 'children.children.children.children.likes',
        ])
        ->latest()
        ->get()
        ->map($formatComment);

    return Inertia::render('home/ar-show-Episodes', [
        'episode' => $episode,
        'videos' => $episode->videos,
        'series' => $episode->series,
        'series' => $episode->series,
        'initialSeriesEpisodes' => $initialSeriesEpisodes,
        'latestEpisodes' => $latestEpisodes,
        'comments' => $comments,
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
    public function latestPaginated(Request $request)
    {
        $episodes = Episode::with('series')
            ->orderBy('id', 'desc')
            ->paginate(15);

        return response()->json($episodes);
    }

    public function seriesEpisodesPaginated(Request $request, Anime $series)
    {
        $query = Episode::where('series_id', $series->id)
            ->orderBy('episode_number', 'asc');

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('episode_number', 'LIKE', "%{$search}%");
            });
        }

        $episodes = $query->paginate(20);

        return response()->json($episodes);
    }
}
