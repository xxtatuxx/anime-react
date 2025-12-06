<?php

namespace App\Observers;

use App\Models\Anime;
use App\Http\Controllers\Home\HomeController;
use App\Http\Controllers\AnimeController;

class AnimeObserver
{
    /**
     * عند إنشاء أنمي جديد
     */
    public function created(Anime $anime): void
    {
        HomeController::refreshAnimesCache();
        AnimeController::clearLatestTvAnimeCache();
    }

    /**
     * عند تحديث أنمي
     */
    public function updated(Anime $anime): void
    {
        HomeController::refreshAnimesCache();
        HomeController::clearAnimeShowCache($anime->id);
        AnimeController::clearLatestTvAnimeCache();
    }

    /**
     * عند حذف أنمي
     */
    public function deleted(Anime $anime): void
    {
        HomeController::refreshAnimesCache();
        HomeController::clearAnimeShowCache($anime->id);
        AnimeController::clearLatestTvAnimeCache();
    }
}
