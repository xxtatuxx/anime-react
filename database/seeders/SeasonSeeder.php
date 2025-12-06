<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SeasonSeeder extends Seeder
{
    public function run(): void
    {
        $seasons = [
            'الشتاء' => 'Winter',
            'الربيع' => 'Spring',
            'الصيف' => 'Summer',
            'الخريف' => 'Autumn',
        ];

        $startYear = 1980;
        $endYear = 2016;

        $data = [];

        for ($year = $startYear; $year <= $endYear; $year++) {
            foreach ($seasons as $ar => $en) {
                // تحديد الشهر حسب الموسم
                switch ($ar) {
                    case 'الشتاء':
                        $month = 1;
                        break;
                    case 'الربيع':
                        $month = 4;
                        break;
                    case 'الصيف':
                        $month = 7;
                        break;
                    case 'الخريف':
                        $month = 10;
                        break;
                }

                $date = Carbon::create($year, $month, 1);

                $data[] = [
                    'name' => "موسم {$ar} - {$year}",      // بالعربي
                    'name_en' => "{$en} Season - {$year}",  // بالإنجليزية
                    'slug' => Str::slug("{$en}-season-{$year}"),
                    'is_active' => true,
                    'user_id' => 1,
                    'created_at' => $date,
                    'updated_at' => $date,
                ];
            }
        }

        DB::table('seasons')->insert($data);
    }
}
