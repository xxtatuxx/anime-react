<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewEpisodeNotification extends Notification
{
    use Queueable;

    public $episode;

    /**
     * Create a new notification instance.
     */
    public function __construct($episode)
    {
        $this->episode = $episode;
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
            'title' => 'تم إضافة حلقة جديدة: ' . $this->episode->title,
            'link' => '/Front-end-react/dist/index.html#/episodes/' . $this->episode->id,
            'image' => $this->episode->thumbnail,
            'icon' => 'film',
            'time' => $this->episode->created_at->diffForHumans(),
            'duration' => $this->episode->duration, // Add duration
            'type' => 'episode', // Add type identifier
        ];
    }
}
