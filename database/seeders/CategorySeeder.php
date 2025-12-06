<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['ar' => 'أكشن', 'en' => 'Action'],
            ['ar' => 'رعب', 'en' => 'Horror'],
            ['ar' => 'رومنسي', 'en' => 'Romance'],
            ['ar' => 'خيال علمي', 'en' => 'Sci-Fi'],
            ['ar' => 'مغامرات', 'en' => 'Adventure'],
            ['ar' => 'كوميدي', 'en' => 'Comedy'],
            ['ar' => 'رياضة', 'en' => 'Sports'],
            ['ar' => 'مدرسي', 'en' => 'School'],
            ['ar' => 'سحر', 'en' => 'Magic'],
            ['ar' => 'تشويق', 'en' => 'Thriller'],
            ['ar' => 'دراما', 'en' => 'Drama'],
            ['ar' => 'غموض', 'en' => 'Mystery'],
            ['ar' => 'تاريخي', 'en' => 'Historical'],
            ['ar' => 'فانتازيا', 'en' => 'Fantasy'],
            ['ar' => 'خيال مظلم', 'en' => 'Dark Fantasy'],
            ['ar' => 'حياة يومية', 'en' => 'Slice of Life'],
            ['ar' => 'موسيقي', 'en' => 'Music'],
            ['ar' => 'حركة وقتال', 'en' => 'Martial Arts'],
            ['ar' => 'إيتشي', 'en' => 'Ecchi'],
            ['ar' => 'شوجو', 'en' => 'Shoujo'],
            ['ar' => 'شونين', 'en' => 'Shounen'],
            ['ar' => 'سينين', 'en' => 'Seinen'],
            ['ar' => 'غموض نفسي', 'en' => 'Psychological'],
            ['ar' => 'مسرحي', 'en' => 'Theatrical'],
        ];

        $data = [];

        foreach ($categories as $cat) {
            $data[] = [
                'user_id' => 1,
                'name' => $cat['ar'],
                'name_en' => $cat['en'],
                'slug' => Str::slug($cat['en']),
                'description' => null,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('categories')->insert($data);
    }
}
