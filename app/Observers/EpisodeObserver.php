<?php

namespace App\Observers;

use App\Models\Episode;
use App\Http\Controllers\Home\HomeController;
use App\Http\Controllers\AnimeController;

class EpisodeObserver
{
    /**
     * عند إنشاء حلقة جديدة
     */
    public function created(Episode $episode): void
    {
        HomeController::refreshEpisodesCache();
        AnimeController::clearLatestTvAnimeCache();
    }

    /**
     * عند تحديث حلقة
     */
    public function updated(Episode $episode): void
    {
        HomeController::refreshEpisodesCache();
        AnimeController::clearLatestTvAnimeCache();
    }

    /**
     * عند حذف حلقة
     */
    public function deleted(Episode $episode): void
    {
        HomeController::refreshEpisodesCache();
        AnimeController::clearLatestTvAnimeCache();
    }
}
