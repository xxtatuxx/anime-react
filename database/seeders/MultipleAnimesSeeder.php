<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Anime;
use App\Models\Category;

class MultipleAnimesSeeder extends Seeder
{
    public function run()
    {
        // قائمة أكثر من 20 أنمي
        $animes = [
            [
                'title' => 'أبطال الفضاء',
                'title_en' => 'Space Heroes',
                'description' => 'تتبع هذه السلسلة مجموعة من الأبطال الذين يغامرون عبر الفضاء، يواجهون الفضائيين والأخطار المجهولة، مع الكثير من الأكشن والتشويق.',
                'description_en' => 'This series follows a group of heroes venturing through space, facing aliens and unknown dangers, full of action and suspense.',
                'seasons' => 3,
                'status' => 'Running',
                'release_date' => '2010-01-10',
                'rating' => 8.5,
                'image' => 'animes/space_heroes.jpg',
                'cover' => 'animes/space_heroes_cover.jpg',
                'studio_name' => 'Galaxy Studio',
                'duration' => 24,
                'language' => 'ja',
                'type' => 'TV',
                'is_active' => true,
            ],
            [
                'title' => 'سحر الغابة',
                'title_en' => 'Forest Magic',
                'description' => 'قصة سحرية عن مخلوقات الغابة والكائنات الأسطورية، مليئة بالمغامرة، الغموض، والدروس الأخلاقية الجميلة.',
                'description_en' => 'A magical story about forest creatures and mythical beings, full of adventure, mystery, and beautiful moral lessons.',
                'seasons' => 2,
                'status' => 'Completed',
                'release_date' => '2015-04-15',
                'rating' => 8.0,
                'image' => 'animes/forest_magic.jpg',
                'cover' => 'animes/forest_magic_cover.jpg',
                'studio_name' => 'Magic Forest Studio',
                'duration' => 22,
                'language' => 'ja',
                'type' => 'TV',
                'is_active' => true,
            ],
            [
                'title' => 'أسرار المحيط',
                'title_en' => 'Ocean Secrets',
                'description' => 'تحكي عن عالم المحيط الغامض، مغامرات الغواصين والكائنات البحرية المدهشة، مع تحديات ومواقف مثيرة.',
                'description_en' => 'Tells about the mysterious ocean world, adventures of divers and amazing sea creatures, full of challenges and thrilling moments.',
                'seasons' => 1,
                'status' => 'Running',
                'release_date' => '2018-07-22',
                'rating' => 8.8,
                'image' => 'animes/ocean_secrets.jpg',
                'cover' => 'animes/ocean_secrets_cover.jpg',
                'studio_name' => 'Blue Wave Studio',
                'duration' => 25,
                'language' => 'ja',
                'type' => 'TV',
                'is_active' => true,
            ],
            [
                'title' => 'أبطال المدينة',
                'title_en' => 'City Heroes',
                'description' => 'مجموعة من الأبطال يحافظون على سلامة المدينة من الأشرار والمجرمين، مع معارك مثيرة وأحداث مشوقة.',
                'description_en' => 'A group of heroes protect the city from villains and criminals, full of thrilling battles and exciting events.',
                'seasons' => 4,
                'status' => 'Running',
                'release_date' => '2012-03-18',
                'rating' => 8.3,
                'image' => 'animes/city_heroes.jpg',
                'cover' => 'animes/city_heroes_cover.jpg',
                'studio_name' => 'Urban Studio',
                'duration' => 24,
                'language' => 'ja',
                'type' => 'TV',
                'is_active' => true,
            ],
            [
                'title' => 'نينجا الظل',
                'title_en' => 'Shadow Ninja',
                'description' => 'قصة نينجا شاب يتعلم أسرار القتال والتخفي، ويواجه أعداءه في معارك ملحمية، مع الكثير من الأكشن والتشويق.',
                'description_en' => 'A story of a young ninja learning the secrets of combat and stealth, facing enemies in epic battles, full of action and suspense.',
                'seasons' => 3,
                'status' => 'Completed',
                'release_date' => '2014-09-12',
                'rating' => 8.7,
                'image' => 'animes/shadow_ninja.jpg',
                'cover' => 'animes/shadow_ninja_cover.jpg',
                'studio_name' => 'Ninja Studio',
                'duration' => 23,
                'language' => 'ja',
                'type' => 'TV',
                'is_active' => true,
            ],
            [
                'title' => 'مملكة الديناصورات',
                'title_en' => 'Dinosaur Kingdom',
                'description' => 'رحلة مليئة بالمغامرة بين الديناصورات العظيمة، مليئة بالغموض، الأخطار، والدروس الشيقة للأطفال.',
                'description_en' => 'An adventurous journey among the mighty dinosaurs, full of mystery, dangers, and fun lessons for kids.',
                'seasons' => 2,
                'status' => 'Completed',
                'release_date' => '2011-06-05',
                'rating' => 8.2,
                'image' => 'animes/dinosaur_kingdom.jpg',
                'cover' => 'animes/dinosaur_kingdom_cover.jpg',
                'studio_name' => 'Prehistoric Studio',
                'duration' => 22,
                'language' => 'ja',
                'type' => 'TV',
                'is_active' => true,
            ],
            [
                'title' => 'مدينة الأشباح',
                'title_en' => 'Ghost Town',
                'description' => 'تحكي قصة مدينة مهجورة يسكنها الأشباح والأرواح الغامضة، مع مغامرات مخيفة ومشوقة.',
                'description_en' => 'The story of an abandoned city inhabited by ghosts and mysterious spirits, full of spooky and thrilling adventures.',
                'seasons' => 1,
                'status' => 'Running',
                'release_date' => '2016-10-31',
                'rating' => 8.1,
                'image' => 'animes/ghost_town.jpg',
                'cover' => 'animes/ghost_town_cover.jpg',
                'studio_name' => 'Haunted Studio',
                'duration' => 24,
                'language' => 'ja',
                'type' => 'TV',
                'is_active' => true,
            ],
            // أضف المزيد بنفس النمط لتصل إلى 20+ أنمي
        ];

        // إنشاء التصنيفات
        $categoryNames = ['أكشن', 'مغامرة', 'تشويق', 'خارق للطبيعة', 'كوميديا', 'دراما'];
        $categoryIds = [];
        foreach ($categoryNames as $name) {
            $slug = Str::slug($name, '-');
            $category = Category::firstOrCreate(
                ['slug' => $slug],
                ['name' => $name]
            );
            $categoryIds[] = $category->id;
        }

        // إنشاء الأنميات وربط التصنيفات
        foreach ($animes as $animeData) {
            $slugAr = Str::slug($animeData['title'], '-');
            $slugEn = Str::slug($animeData['title_en'], '-');

            $anime = Anime::create(array_merge($animeData, [
                'slug' => $slugAr,
                'slug_en' => $slugEn,
                'user_id' => 1,
            ]));

            $anime->categories()->sync($categoryIds);
        }
    }
}
