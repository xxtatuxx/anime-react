<?php

namespace App\Observers;

use App\Models\Season;
use App\Http\Controllers\Home\HomeController;

class SeasonObserver
{
    public function created(Season $season): void
    {
        HomeController::clearSeasonsCache();
    }

    public function updated(Season $season): void
    {
        HomeController::clearSeasonsCache();
    }

    public function deleted(Season $season): void
    {
        HomeController::clearSeasonsCache();
    }
}
