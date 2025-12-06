<?php

namespace App\Http\Controllers;

use App\Models\History;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HistoryController extends Controller
{
    /**
     * API endpoint for dropdown (limited)
     */
    public function index()
    {
        $history = History::where('user_id', Auth::id())
            ->with(['episode.series'])
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return $this->formatHistoryItem($item);
            });

        return response()->json($history);
    }

    /**
     * Full page view with pagination
     */
    public function page()
    {
        $history = History::where('user_id', Auth::id())
            ->with(['episode.series'])
            ->latest()
            ->paginate(20);

        $formattedHistory = $history->through(function ($item) {
            return $this->formatHistoryItem($item);
        });

        return \Inertia\Inertia::render('home/HistoryPage', [
            'history' => $formattedHistory,
        ]);
    }

    /**
     * Clear all history
     */
    public function clearAll()
    {
        History::where('user_id', Auth::id())->delete();
        return response()->json(['message' => 'History cleared']);
    }

    private function formatHistoryItem($item)
    {
        return [
            'id' => $item->id,
            'type' => $item->type,
            'episode_id' => $item->episode_id,
            'title' => $item->episode->title,
            'episode_number' => $item->episode->episode_number,
            'series_title' => $item->episode->series->title,
            'image' => $item->episode->thumbnail ? '/storage/' . $item->episode->thumbnail : ($item->episode->series->cover ? '/storage/' . $item->episode->series->cover : '/animes/placeholder.jpg'),
            'created_at' => $item->created_at->diffForHumans(),
            'metadata' => $item->metadata,
        ];
    }
}
