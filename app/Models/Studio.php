<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Studio extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'name_en', 'slug', 'date', 'is_active', 'user_id'];

    protected $casts = [
        'date' => 'date',
    ];

    // توليد slug تلقائي عند إنشاء سجل جديد
    protected static function booted()
    {
        static::creating(function ($studio) {
            if (empty($studio->slug)) {
                $studio->slug = Str::slug($studio->name);
            }
        });
    }

    // علاقة مع المستخدم
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
