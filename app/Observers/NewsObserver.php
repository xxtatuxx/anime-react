<?php

namespace App\Observers;

use App\Models\News;
use App\Http\Controllers\Home\HomeController;

class NewsObserver
{
    public function created(News $news): void
    {
        HomeController::clearNewsCache();
    }

    public function updated(News $news): void
    {
        HomeController::clearNewsCache();
    }

    public function deleted(News $news): void
    {
        HomeController::clearNewsCache();
    }
}
