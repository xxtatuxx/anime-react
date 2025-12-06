<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('animes', function (Blueprint $table) {
            $table->id();

            // العنوان والوصف بلغتين
            $table->string('title');          // عربي
            $table->string('title_en')->nullable(); // إنجليزي
            $table->text('description')->nullable();      // عربي
            $table->text('description_en')->nullable();   // إنجليزي

            $table->string('category')->nullable();
            $table->integer('seasons')->default(1);
            $table->string('status')->default('Ongoing');
            $table->date('release_date')->nullable();
            $table->decimal('rating', 3, 1)->nullable();
            $table->string('image')->nullable();
            $table->string('cover')->nullable();

            // معلومات الاستوديو
            $table->string('studio_name')->nullable();
            $table->string('slug')->nullable();        // عربي
            $table->string('slug_en')->nullable();     // إنجليزي

            // تفاصيل إضافية
            $table->integer('duration')->nullable();
            $table->string('language')->nullable();
            $table->string('trailer')->nullable();
            $table->string('type')->nullable();
            $table->boolean('is_active')->default(true);

            // ربط باليوزر
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');

            $table->timestamps();

            // خيارات إضافية يمكن تفعيلها لاحقاً
            // $table->text('stream_video')->nullable();
            // $table->string('studio_country')->nullable();
            // $table->year('studio_founded')->nullable();
            // $table->string('season')->nullable(); // الموسم الحالي
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('animes');
    }
};
