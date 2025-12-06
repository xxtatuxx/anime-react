<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Type extends Model
{
    use HasFactory;

    // إضافة الحقول الجديدة
    protected $fillable = ['type', 'name_en', 'slug', 'is_active','user_id'];

    // توليد slug تلقائي عند إنشاء سجل جديد
    protected static function booted()
    {
        static::creating(function ($type) {
            if (empty($type->slug)) {
                $type->slug = Str::slug($type->type);
            }
        });
    }
// App/Models/Type.php
public function user()
{
    return $this->belongsTo(User::class, 'user_id');
}


}
