<?php

namespace App\Services;

use App\Models\History;
use Illuminate\Support\Facades\Auth;

class HistoryService
{
    public static function record($episodeId, $type, $metadata = null)
    {
        if (!Auth::check()) {
            return;
        }

        // For 'view', we might want to update the existing record instead of creating a new one every time
        // to avoid cluttering the history with duplicates for the same episode.
        // However, the user asked for "every time I enter... it records".
        // But usually history shows the *last* time you watched.
        // Let's update if exists for 'view', or create new if not.
        // Actually, for 'view', let's update the timestamp if it exists, or create new.
        
        if ($type === 'view') {
            $history = History::where('user_id', Auth::id())
                ->where('episode_id', $episodeId)
                ->where('type', 'view')
                ->first();

            if ($history) {
                $history->touch(); // Update updated_at
                return;
            }
        }

        // For comments/likes, we definitely want separate entries or maybe just one entry per action type per episode?
        // "If comment, give comment icon... if like, give like icon".
        // If I comment 5 times, do I want 5 history entries? Probably yes, or maybe just "You commented on Episode X".
        // Let's record everything as requested.

        History::create([
            'user_id' => Auth::id(),
            'episode_id' => $episodeId,
            'type' => $type,
            'metadata' => $metadata,
        ]);
    }
}
