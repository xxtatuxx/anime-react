<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EpisodeVideo extends Model
{
    use HasFactory;

    protected $fillable = [
        'episode_id',
        'video_url',
        'episode_number',
        'anime_title',
        'anime_image',
    ];

    public function episode()
    {
        return $this->belongsTo(Episode::class);
    }
}
