<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anime extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'title_en',         // عنوان بالإنجليزية
        'description',
        'description_en',   // وصف بالإنجليزية
        'category',
        'seasons',
        'status',
        'release_date',
        'rating',
        'image',
        'cover',
        'studio_name',
        'slug',
        'slug_en',          // رابط بالإنجليزية
        'duration',
        'language',
        'trailer',
        'type',
        'is_active',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function studio()
{
    return $this->belongsTo(Studio::class);
}

 public function types()
    {
        // إذا الحقل نوع واحد
        return $this->type; 

        // إذا كنت تريد مصفوفة من أنواع مفصولة بفاصلة
        // return explode(',', $this->type); 
    }

    // علاقة مع الحلقات
    public function episodes()
    {
        return $this->hasMany(Episode::class, 'series_id');
    }
// app/Models/Anime.php
public function categories()
{
    return $this->belongsToMany(Category::class, 'anime_category');
}

// app/Models/Category.php
public function animes()
{
    return $this->belongsToMany(Anime::class, 'anime_category');
}
// app/Models/Anime.php
public function season()
{
    return $this->belongsTo(Season::class, 'seasons'); // 'seasons' هو الحقل الذي يحوي الـ ID
}

}
