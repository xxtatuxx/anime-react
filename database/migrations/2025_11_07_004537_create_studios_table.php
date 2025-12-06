<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('studios', function (Blueprint $table) {
            $table->id();
            $table->string('name');           // اسم الاستوديو بالعربي
            $table->string('name_en');        // اسم الاستوديو بالإنجليزي
            $table->string('slug')->unique(); // السلاج، يجب أن يكون فريد
            $table->date('date')->nullable(); // التاريخ
            $table->boolean('is_active')->default(true);
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('studios');
    }
};
