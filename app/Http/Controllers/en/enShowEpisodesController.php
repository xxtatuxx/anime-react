<?php

namespace App\Http\Controllers\en;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Episode;
use App\Models\Anime;
use App\Models\EpisodeVideo;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;

class enShowEpisodesController extends Controller
{
public function show(Episode $episode)
{
    // 1. جلب الحلقة الحالية
    $episode = Episode::with(['series', 'videos'])->findOrFail($episode->id);

    // 2. جلب كل حلقات هذا الأنمي (للشريط الجانبي العلوي)
    $allEpisodes = Episode::where('series_id', $episode->series_id)
        ->orderBy('episode_number', 'asc')
        ->get();

    // 3. جلب آخر الحلقات المضافة في الموقع ككل (للجزء السفلي من الشريط)
    // نستخدم with('series') لنعرض اسم الأنمي وصورته
    $latestEpisodes = Episode::with('series')
        ->orderBy('created_at', 'desc')
        ->limit(15) // نجلب أول 15 حلقة كبداية
        ->get();

    return Inertia::render('home-en/en-show-Episodes', [
        'episode' => $episode,
        'videos' => $episode->videos,
        'series' => $episode->series,
        'allEpisodes' => $allEpisodes,
        'latestEpisodes' => $latestEpisodes, // <-- المتغير الجديد
    ]);
}
}
