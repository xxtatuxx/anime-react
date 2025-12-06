<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Episode;
use App\Models\Reply;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function store(Request $request, Episode $episode)
    {
        $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        $comment = $episode->comments()->create([
            'user_id' => Auth::id(),
            'content' => $request->content,
            'parent_id' => $request->parent_id,
        ]);

        // Notify parent comment owner if it's a reply
        if ($request->parent_id) {
            $parentComment = Comment::find($request->parent_id);
            if ($parentComment) {
                \Illuminate\Support\Facades\Log::info('Parent comment found', ['id' => $parentComment->id, 'user_id' => $parentComment->user_id]);
                if ($parentComment->user_id !== Auth::id()) {
                    \Illuminate\Support\Facades\Log::info('Dispatching NewReplyNotification');
                    $parentComment->user->notify(new \App\Notifications\NewReplyNotification($parentComment, $comment));
                } else {
                    \Illuminate\Support\Facades\Log::info('User replying to self - no notification');
                }
            } else {
                \Illuminate\Support\Facades\Log::info('Parent comment not found');
            }
        }

        // Record History
        \App\Services\HistoryService::record($episode->id, $request->parent_id ? 'reply' : 'comment', ['content_snippet' => substr($request->content, 0, 50)]);

        // Record History
        $historyMetadata = [
            'comment_id' => $comment->id,
            'content' => \Illuminate\Support\Str::limit($comment->content, 100),
        ];

        if ($request->parent_id) {
            $parentComment = Comment::with('user')->find($request->parent_id);
            $historyMetadata['replied_to_user'] = $parentComment?->user?->name ?? 'مستخدم';
            $historyMetadata['replied_to_content'] = \Illuminate\Support\Str::limit($parentComment?->content ?? '', 50);
        }

        \App\Models\History::create([
            'user_id' => Auth::id(),
            'episode_id' => $episode->id,
            'type' => $request->parent_id ? 'reply' : 'comment',
            'metadata' => $historyMetadata,
        ]);

        return back();
    }

    public function update(Request $request, Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update([
            'content' => $request->content,
        ]);

        return back();
    }

    public function destroy(Comment $comment)
    {
        if ($comment->user_id !== Auth::id()) {
            abort(403);
        }

        $comment->delete();

        return back();
    }

    public function toggleLike(Request $request, Comment $comment)
    {
        $request->validate([
            'is_like' => 'required|boolean',
        ]);

        $user = Auth::user();
        $existingLike = $comment->likes()->where('user_id', $user->id)->first();

        if ($existingLike) {
            if ($existingLike->is_like == $request->is_like) {
                // Remove if clicking same action
                $existingLike->delete();
            } else {
                // Update if changing from like to dislike or vice versa
                $existingLike->update(['is_like' => $request->is_like]);
                
                // Notify if it's a like (optional: notify on dislike too?)
                // Usually apps notify on Likes, but maybe not Dislikes to avoid negativity.
                // User asked for "like or dislike notification".
                if ($comment->user_id !== $user->id) {
                    $comment->user->notify(new \App\Notifications\CommentInteractionNotification($comment, $user, $request->is_like));
                }
            }
        } else {
            $comment->likes()->create([
                'user_id' => $user->id,
                'is_like' => $request->is_like,
            ]);

            if ($comment->user_id !== $user->id) {
                $comment->user->notify(new \App\Notifications\CommentInteractionNotification($comment, $user, $request->is_like));
            }

            // Record Like History
            if ($request->is_like) {
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

        return back();
    }
}
