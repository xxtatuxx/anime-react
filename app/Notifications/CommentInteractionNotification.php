<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CommentInteractionNotification extends Notification
{
    use Queueable;

    public $comment;
    public $user;
    public $isLike;

    /**
     * Create a new notification instance.
     */
    public function __construct($comment, $user, $isLike)
    {
        $this->comment = $comment;
        $this->user = $user;
        $this->isLike = $isLike;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $action = $this->isLike ? 'بالإعجاب بـ' : 'بعدم الإعجاب بـ';
        return [
            'type' => 'like',
            'title' => 'قام ' . $this->user->name . ' ' . $action . ' تعليقك',
            'link' => '/Front-end-react/dist/index.html#/episodes/' . $this->comment->episode_id,
            'image' => $this->user->avatar,
            'icon' => $this->isLike ? 'thumbs-up' : 'thumbs-down',
            'time' => now()->diffForHumans(),
            'liker_name' => $this->user->name,
            'is_like' => $this->isLike,
            'comment_content' => \Illuminate\Support\Str::limit($this->comment->content, 100),
        ];
    }
}
