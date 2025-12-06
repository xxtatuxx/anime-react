<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
    Schema::create('news', function (Blueprint $table) {
    $table->id();

    // الحقول بالعربية
    $table->string('title_ar');
    $table->text('subtitle_ar')->nullable();
    $table->text('description_ar')->nullable();
    $table->string('link_ar')->nullable(); // الرابط بالعربية

    // الحقول بالإنجليزية
    $table->string('title_en');
    $table->text('subtitle_en')->nullable();
    $table->text('description_en')->nullable();
    $table->string('link')->nullable();  // الرابط بالإنجليزية

    $table->string('image')->nullable();
    $table->foreignId('user_id')->constrained()->onDelete('cascade');

    $table->timestamps();
});


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news');
    }
};
