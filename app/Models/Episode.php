<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Episode extends Model
{
    use HasFactory;

    protected $fillable = [
        'series_id',
        'title',
        'title_en',
        'slug',
        'slug_en',
        'episode_number',
        'description',
        'description_en',
        'thumbnail',
        'banner',
        'video_url',
        'duration',
        'quality',
        'video_format',
        'release_date',
        'is_published',
        'language',
        'subtitles',
        'rating',
        'views_count',
        'likes_count',
    ];

    protected $casts = [
        'release_date' => 'date',
        'is_published' => 'boolean',
        'subtitles' => 'array',
        'rating' => 'float',
        'views_count' => 'integer',
        'likes_count' => 'integer',
        'episode_number' => 'integer',
        'duration' => 'integer',
    ];

    // توليد slug تلقائي عند إنشاء سجل جديد
    protected static function booted()
    {
        static::creating(function ($episode) {
            if (empty($episode->slug)) {
                $episode->slug = Str::slug($episode->title);
            }
            if (empty($episode->slug_en) && $episode->title_en) {
                $episode->slug_en = Str::slug($episode->title_en);
            }
        });
    }

    // علاقة مع المسلسل (Anime)
    public function series()
    {
        return $this->belongsTo(Anime::class, 'series_id');
    }
    
    public function videos()
    {
        return $this->hasMany(EpisodeVideo::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
