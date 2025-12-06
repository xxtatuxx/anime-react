<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('episodes', function (Blueprint $table) {
            $table->id();

            // 🔗 العلاقة مع المسلسل
            $table->foreignId('series_id')->constrained('animes')->onDelete('cascade');

            // 📺 المعلومات الأساسية (عربية + إنجليزية)
            $table->string('title');                // العنوان بالعربية
            $table->string('title_en')->nullable(); // العنوان بالإنجليزية

            $table->string('slug')->unique();       // الرابط بالعربية
            $table->string('slug_en')->unique()->nullable(); // الرابط بالإنجليزية

            $table->integer('episode_number');      // رقم الحلقة داخل المسلسل

            // 📝 المحتوى والوصف (عربية + إنجليزية)
            $table->text('description')->nullable();   
            $table->text('description_en')->nullable();

            $table->string('thumbnail')->nullable();
            $table->string('banner')->nullable();
            $table->string('video_url')->nullable();

            // 🧩 إعدادات الفيديو
            $table->integer('duration')->nullable();     // مدة الحلقة بالدقائق
            $table->string('quality')->nullable();       // الجودة (مثلاً: 720p, 1080p, 4K)
            $table->string('video_format')->nullable();  // صيغة الفيديو (mp4, mkv, webm...)

            // ⏱️ معلومات إضافية
            $table->date('release_date')->nullable();
            $table->boolean('is_published')->default(false);

            // 🌍 اللغة والترجمة
            $table->string('language')->default('ar');
            $table->json('subtitles')->nullable();

            // ⭐ التفاعل والإحصائيات
            $table->float('rating', 3, 1)->default(0);
            $table->integer('views_count')->default(0);
            $table->integer('likes_count')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('episodes');
    }
};
