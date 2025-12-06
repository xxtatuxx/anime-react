<?php

namespace App\Observers;

use App\Models\Category;
use App\Http\Controllers\Home\HomeController;

class CategoryObserver
{
    public function created(Category $category): void
    {
        HomeController::clearCategoriesCache();
    }

    public function updated(Category $category): void
    {
        HomeController::clearCategoriesCache();
    }

    public function deleted(Category $category): void
    {
        HomeController::clearCategoriesCache();
    }
}
