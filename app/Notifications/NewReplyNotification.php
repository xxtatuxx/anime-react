<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewReplyNotification extends Notification
{
    use Queueable;

    public $comment;
    public $reply;

    public function __construct($comment, $reply)
    {
        $this->comment = $comment;
        $this->reply = $reply;
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
        return [
            'type' => 'reply',
            'title' => 'قام ' . $this->reply->user->name . ' بالرد على تعليقك',
            'link' => '/Front-end-react/dist/index.html#/episodes/' . $this->comment->episode_id,
            'image' => $this->reply->user->avatar,
            'icon' => 'message-circle',
            'time' => $this->reply->created_at->diffForHumans(),
            'replier_name' => $this->reply->user->name,
            'reply_content' => \Illuminate\Support\Str::limit($this->reply->content, 100),
            'original_comment' => \Illuminate\Support\Str::limit($this->comment->content, 80),
        ];
    }
}
