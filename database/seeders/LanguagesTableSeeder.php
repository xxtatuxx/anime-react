<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LanguagesTableSeeder extends Seeder
{
    public function run(): void
    {
        $languages = [
            // دول عربية
            ['name' => 'المملكة العربية السعودية', 'name_en' => 'Saudi Arabia'],
            ['name' => 'مصر', 'name_en' => 'Egypt'],
            ['name' => 'الإمارات العربية المتحدة', 'name_en' => 'United Arab Emirates'],
            ['name' => 'الكويت', 'name_en' => 'Kuwait'],
            ['name' => 'قطر', 'name_en' => 'Qatar'],
            ['name' => 'البحرين', 'name_en' => 'Bahrain'],
            ['name' => 'عُمان', 'name_en' => 'Oman'],
            ['name' => 'الأردن', 'name_en' => 'Jordan'],
            ['name' => 'المغرب', 'name_en' => 'Morocco'],
            ['name' => 'تونس', 'name_en' => 'Tunisia'],
            ['name' => 'ليبيا', 'name_en' => 'Libya'],
            ['name' => 'الجزائر', 'name_en' => 'Algeria'],
            ['name' => 'سوريا', 'name_en' => 'Syria'],
            ['name' => 'لبنان', 'name_en' => 'Lebanon'],

            // دول أوروبية
            ['name' => 'فرنسا', 'name_en' => 'France'],
            ['name' => 'ألمانيا', 'name_en' => 'Germany'],
            ['name' => 'إيطاليا', 'name_en' => 'Italy'],
            ['name' => 'إسبانيا', 'name_en' => 'Spain'],
            ['name' => 'المملكة المتحدة', 'name_en' => 'United Kingdom'],
            ['name' => 'هولندا', 'name_en' => 'Netherlands'],
            ['name' => 'سويسرا', 'name_en' => 'Switzerland'],
            ['name' => 'السويد', 'name_en' => 'Sweden'],
            ['name' => 'النرويج', 'name_en' => 'Norway'],
            ['name' => 'بلجيكا', 'name_en' => 'Belgium'],
            ['name' => 'أوكرانيا', 'name_en' => 'Ukraine'],
            ['name' => 'بولندا', 'name_en' => 'Poland'],
            ['name' => 'الدنمارك', 'name_en' => 'Denmark'],
            ['name' => 'فنلندا', 'name_en' => 'Finland'],
            ['name' => 'البرتغال', 'name_en' => 'Portugal'],

            // دول آسيوية
            ['name' => 'اليابان', 'name_en' => 'Japan'],
            ['name' => 'الصين', 'name_en' => 'China'],
            ['name' => 'الهند', 'name_en' => 'India'],
            ['name' => 'كوريا الجنوبية', 'name_en' => 'South Korea'],
            ['name' => 'إندونيسيا', 'name_en' => 'Indonesia'],
            ['name' => 'باكستان', 'name_en' => 'Pakistan'],
            ['name' => 'ماليزيا', 'name_en' => 'Malaysia'],
            ['name' => 'فيتنام', 'name_en' => 'Vietnam'],
            ['name' => 'تايلاند', 'name_en' => 'Thailand'],
            ['name' => 'الفلبين', 'name_en' => 'Philippines'],
            ['name' => 'سنغافورة', 'name_en' => 'Singapore'],

            // دول أمريكية
            ['name' => 'الولايات المتحدة', 'name_en' => 'United States'],
            ['name' => 'كندا', 'name_en' => 'Canada'],
            ['name' => 'البرازيل', 'name_en' => 'Brazil'],
            ['name' => 'الأرجنتين', 'name_en' => 'Argentina'],
            ['name' => 'المكسيك', 'name_en' => 'Mexico'],
            ['name' => 'تشيلي', 'name_en' => 'Chile'],
            ['name' => 'كولومبيا', 'name_en' => 'Colombia'],
            ['name' => 'بيرو', 'name_en' => 'Peru'],

            // دول أفريقية
            ['name' => 'جنوب أفريقيا', 'name_en' => 'South Africa'],
            ['name' => 'كينيا', 'name_en' => 'Kenya'],
            ['name' => 'نيجيريا', 'name_en' => 'Nigeria'],
            ['name' => 'إثيوبيا', 'name_en' => 'Ethiopia'],
            ['name' => 'السنغال', 'name_en' => 'Senegal'],
            ['name' => 'غانا', 'name_en' => 'Ghana'],
            ['name' => 'الموزمبيق', 'name_en' => 'Mozambique'],

            // دول أوقيانية
            ['name' => 'أستراليا', 'name_en' => 'Australia'],
            ['name' => 'نيوزيلندا', 'name_en' => 'New Zealand'],
            ['name' => 'فيجي', 'name_en' => 'Fiji'],
            ['name' => 'بابوا غينيا الجديدة', 'name_en' => 'Papua New Guinea'],
        ];

        foreach ($languages as $language) {
            DB::table('languages')->insert([
                'name' => $language['name'],
                'name_en' => $language['name_en'],
                'slug' => Str::slug($language['name_en']),
                'date' => now(),
                'is_active' => true,
                'user_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
