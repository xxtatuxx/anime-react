<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Anime;
use App\Models\Episode;
use App\Models\EpisodeVideo;
use App\Models\Category;

class AnimeNarutoSeeder extends Seeder
{
    public function run()
    {
        // 1. إنشاء الأنمي
        $animeSlugAr = 'naruto';
        $animeSlugEn = 'naruto';

        $anime = Anime::create([
            'title' => 'Naruto',
            'title_en' => 'Naruto',
            'slug' => $animeSlugAr,
            'slug_en' => $animeSlugEn,
            'description' => 'رحلة Naruto Uzumaki ليصبح أقوى نينجا في قريته. مليئة بالمواجهات المثيرة، الصداقات، والخيانة، مع دراما عائلية وشخصيات لا تُنسى.',
            'description_en' => 'The journey of Naruto Uzumaki to become the strongest ninja in his village. Full of exciting battles, friendships, betrayals, family drama, and unforgettable characters.',
            'seasons' => 1,
            'status' => 'Completed',
            'release_date' => '2002-10-03',
            'rating' => 9.0,
            'image' => 'animes/naruto.jpg',
            'cover' => 'animes/naruto_cover.jpg',
            'studio_name' => 'Pierrot',
            'duration' => 23,
            'language' => 'ja',
            'type' => 'TV',
            'is_active' => true,
            'user_id' => 1,
        ]);

        // 2. إنشاء التصنيفات
        $categoryNames = ['أكشن', 'تشويق', 'مغامرة', 'دراما', 'شونين'];
        $categoryIds = [];
        foreach ($categoryNames as $name) {
            $slug = Str::slug($name, '-');
            $category = Category::firstOrCreate(
                ['slug' => $slug],
                ['name' => $name]
            );
            $categoryIds[] = $category->id;
        }
        $anime->categories()->sync($categoryIds);

        // 3. إنشاء 500 حلقة مع وصف غني
        $totalEpisodes = 500;
        $startDate = Carbon::parse('2002-10-03');

        for ($i = 1; $i <= $totalEpisodes; $i++) {
            $title = "حلقة $i - Naruto";
            $titleEn = "Episode $i - Naruto";

            $slugAr = $animeSlugAr . '-' . $i; // naruto-1
            $slugEn = $animeSlugEn . '-' . $i; // naruto-1

            $description = "في هذه الحلقة، Naruto يواصل رحلته ليصبح هوكاجي قريته، يواجه تحديات جديدة، يتعلم تقنيات نينجا متقدمة، ويصنع صداقات جديدة مع رفاقه. الأحداث مليئة بالإثارة، الأكشن، والعاطفة.";
            $descriptionEn = "In this episode, Naruto continues his journey to become the Hokage of his village, faces new challenges, learns advanced ninja techniques, and forms new bonds with his friends. The events are full of excitement, action, and emotion.";

            $episode = Episode::create([
                'series_id' => $anime->id,
                'title' => $title,
                'title_en' => $titleEn,
                'slug' => $slugAr,
                'slug_en' => $slugEn,
                'episode_number' => $i,
                'description' => $description,
                'description_en' => $descriptionEn,
                'thumbnail' => 'animes/naruto.jpg',
                'banner' => 'animes/naruto_cover.jpg',
                'duration' => 23,
                'quality' => '1080p',
                'video_format' => 'mp4',
                'release_date' => $startDate->copy()->addWeeks($i-1),
                'is_published' => true,
                'language' => 'ja',
                'rating' => 8.5 + rand(0, 15)/10,
            ]);

            // إضافة رابط الفيديو
            EpisodeVideo::create([
                'episode_id' => $episode->id,
                'video_url' => "https://video.example.com/naruto_ep{$i}_1080.mp4",
                'anime_title' => $anime->title,
            ]);
        }
    }
}
