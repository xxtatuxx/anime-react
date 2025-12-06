<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\Anime;
use App\Models\Episode;
use App\Models\EpisodeVideo;
use App\Models\Category;

class AnimeOnePieceSeeder extends Seeder
{
    public function run()
    {
        // 1. إنشاء الأنمي
        $animeSlugAr = 'one-piece';
        $animeSlugEn = 'one-piece';

        $anime = Anime::create([
            'title' => 'One Piece',
            'title_en' => 'One Piece',
            'slug' => $animeSlugAr,
            'slug_en' => $animeSlugEn,
            'description' => 'مغامرات Luffy وطاقمه للبحث عن كنز One Piece الأسطوري. رحلة مليئة بالتحديات، المعارك، واللحظات الدرامية.',
            'description_en' => 'The adventures of Luffy and his crew in search of the legendary One Piece treasure. A journey full of challenges, battles, and dramatic moments.',
            'seasons' => 1,
            'status' => 'Running',
            'release_date' => '1999-10-20',
            'rating' => 9.2,
            'image' => 'animes/onepiece.jpg',
            'cover' => 'animes/onepiece_cover.jpg',
            'studio_name' => 'Toei Animation',
            'duration' => 24,
            'language' => 'ja',
            'type' => 'TV',
            'is_active' => true,
            'user_id' => 1,
        ]);

        // 2. إنشاء التصنيفات
        $categoryNames = ['أكشن', 'تشويق', 'مغامرة', 'كوميديا', 'دراما'];
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
        $startDate = Carbon::parse('1999-10-20');

        for ($i = 1; $i <= $totalEpisodes; $i++) {
            $title = "Episode $i - One Piece";
            $titleEn = "Episode $i - One Piece";

            $slugAr = $animeSlugAr . '-' . $i; // one-piece-1
            $slugEn = $animeSlugEn . '-' . $i; // one-piece-1

            $description = "في هذه الحلقة، Luffy وطاقمه يواصلون مغامرتهم في عالم One Piece، يواجهون تحديات جديدة، يتعرفون على شخصيات مثيرة، ويكتشفون أسرارًا جديدة. الأحداث مشوقة ودرامية في أوجها.";
            $descriptionEn = "In this episode, Luffy and his crew continue their adventure in the world of One Piece, facing new challenges, meeting interesting characters, and uncovering new secrets. The events are thrilling and the drama is at its peak.";

            $episode = Episode::create([
                'series_id' => $anime->id,
                'title' => $title,
                'title_en' => $titleEn,
                'slug' => $slugAr,
                'slug_en' => $slugEn,
                'episode_number' => $i,
                'description' => $description,
                'description_en' => $descriptionEn,
                'thumbnail' => 'animes/onepiece.jpg',
                'banner' => 'animes/onepiece_cover.jpg',
                'duration' => 24,
                'quality' => '1080p',
                'video_format' => 'mp4',
                'release_date' => $startDate->copy()->addWeeks($i-1),
                'is_published' => true,
                'language' => 'ja',
                'rating' => 9.0 + rand(0, 10)/10,
            ]);

            // إضافة رابط الفيديو
            EpisodeVideo::create([
                'episode_id' => $episode->id,
                'video_url' => "https://video.example.com/onepiece_ep{$i}_1080.mp4",
                'anime_title' => $anime->title,
            ]);
        }
    }
}
