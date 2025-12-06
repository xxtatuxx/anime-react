<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['ar' => 'مسلسل', 'en' => 'tv'],
            ['ar' => 'فيلم', 'en' => 'Movie'],
            ['ar' => 'حلقة خاصة', 'en' => 'Special'],
            ['ar' => 'OVA', 'en' => 'OVA'],
            ['ar' => 'ONA', 'en' => 'ONA'],
            ['ar' => 'فيلم قصير', 'en' => 'Short Film'],
            ['ar' => 'ميغا حلقة', 'en' => 'Mega Episode'],
            ['ar' => 'مانجا', 'en' => 'Manga'], // النوع الجديد
        ];

        $data = [];

        foreach ($types as $type) {
            $data[] = [
                'user_id' => 1,
                'type' => $type['ar'],
                'name_en' => $type['en'],
                'slug' => Str::slug($type['en']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('types')->insert($data);
    }
}
