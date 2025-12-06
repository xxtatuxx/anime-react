<?php

namespace App\Http\Controllers;

use App\Models\WatchLater;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WatchLaterController extends Controller
{
    /**
     * API endpoint for dropdown (all items)
     */
    public function index()
    {
        $watchLater = WatchLater::where('user_id', Auth::id())
            ->with('episode.series')
            ->latest()
            ->get()
            ->map(function ($item) {
                return $this->formatWatchLaterItem($item);
            });

        return response()->json($watchLater);
    }

    /**
     * Full page view with pagination
     */
    public function page()
    {
        $watchLater = WatchLater::where('user_id', Auth::id())
            ->with('episode.series')
            ->latest()
            ->paginate(20);

        $formattedWatchLater = $watchLater->through(function ($item) {
            return $this->formatWatchLaterItem($item);
        });

        return \Inertia\Inertia::render('home/WatchLaterPage', [
            'watchLater' => $formattedWatchLater,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'episode_id' => 'required|exists:episodes,id',
        ]);

        $watchLater = WatchLater::firstOrCreate([
            'user_id' => Auth::id(),
            'episode_id' => $request->episode_id,
        ]);

        return response()->json(['message' => 'Added to watch later', 'data' => $watchLater]);
    }

    public function destroy($id)
    {
        $deleted = WatchLater::where('user_id', Auth::id())
            ->where('episode_id', $id)
            ->delete();

        return response()->json(['message' => 'Removed from watch later']);
    }

    private function formatWatchLaterItem($item)
    {
        return [
            'id' => $item->episode->id,
            'title' => $item->episode->title,
            'episode_number' => $item->episode->episode_number,
            'image' => $item->episode->thumbnail ? '/storage/' . $item->episode->thumbnail : ($item->episode->series->cover ? '/storage/' . $item->episode->series->cover : '/animes/placeholder.jpg'),
            'series_title' => $item->episode->series->title,
            'watch_later_id' => $item->id,
            'added_at' => $item->created_at->diffForHumans(),
        ];
    }
}
