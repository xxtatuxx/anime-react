<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class StudioSeeder extends Seeder
{
    public function run(): void
    {
        $studios = [
            // استوديوهات يابانية مشهورة بالأنمي
            ['name' => 'استوديو غيبلي', 'name_en' => 'Studio Ghibli', 'date' => '1985-06-15'],
            ['name' => 'كيوتو أنيميشن', 'name_en' => 'Kyoto Animation', 'date' => '1981-06-23'],
            ['name' => 'توهو', 'name_en' => 'Toho', 'date' => '1932-08-31'],
            ['name' => 'مانغا انيميشن', 'name_en' => 'Madhouse', 'date' => '1972-10-16'],
            ['name' => 'بونز', 'name_en' => 'Bones', 'date' => '1998-10-12'],
            ['name' => 'شانغهاي أنيميشن', 'name_en' => 'Sunrise', 'date' => '1972-09-09'],

            // استوديوهات أمريكية مشهورة بالأفلام والمسلسلات والرسوم المتحركة
            ['name' => 'ديزني', 'name_en' => 'Disney', 'date' => '1923-10-16'],
            ['name' => 'بيكسار', 'name_en' => 'Pixar', 'date' => '1986-02-03'],
            ['name' => 'دريم ووركس', 'name_en' => 'DreamWorks', 'date' => '1994-10-12'],
            ['name' => 'يونيفرسال أنيميشن', 'name_en' => 'Universal Animation Studios', 'date' => '1990-01-01'],
            ['name' => 'فوكوكس أنيميشن', 'name_en' => 'Fox Animation Studios', 'date' => '1994-06-01'],
            ['name' => 'وارنر برذرز أنيميشن', 'name_en' => 'Warner Bros. Animation', 'date' => '1980-07-10'],
        ];

        foreach ($studios as $studio) {
            DB::table('studios')->insert([
                'name' => $studio['name'],
                'name_en' => $studio['name_en'],
                'slug' => Str::slug($studio['name_en']),
                'date' => $studio['date'] ? Carbon::parse($studio['date']) : null,
                'is_active' => true,
                'user_id' => 1, // هنا نضع القيمة 1
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
