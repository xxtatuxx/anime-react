<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
protected $fillable = [
    'title_ar', 'subtitle_ar', 'description_ar', 'link_ar',
    'title_en', 'subtitle_en', 'description_en', 'link',
    'image', 'user_id',
];

public function user()
{
    return $this->belongsTo(User::class);
}


}
