<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\ServiceProvider;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request; // ✅ (1) تمت الإضافة: هام جداً للـ Proxy
use Illuminate\Support\Facades\URL; // ✅ (2) تمت الإضافة: لإجبار الـ HTTPS

// Models
use App\Models\Episode;
use App\Models\Anime;
use App\Models\News;
use App\Models\Category;
use App\Models\Season;

// Observers
use App\Observers\EpisodeObserver;
use App\Observers\AnimeObserver;
use App\Observers\NewsObserver;
use App\Observers\CategoryObserver;
use App\Observers\SeasonObserver;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // ✅ (3) إصلاح مشكلة Mixed Content على Railway
        // نطلب من لارافيل الثقة في البروكسي (Railway) واستخدام HTTPS للروابط
        if($this->app->environment('production')) {
            URL::forceScheme('https');
        }

        // إعداد الثقة في البروكسي لضمان قراءة الهيدر بشكل صحيح
        Request::setTrustedProxies(
            ['*'], 
            Request::HEADER_X_FORWARDED_FOR | Request::HEADER_X_FORWARDED_HOST | Request::HEADER_X_FORWARDED_PORT | Request::HEADER_X_FORWARDED_PROTO
        );

        // --- بقية الكود الخاص بك كما هو ---

        JsonResource::withoutWrapping();

        // ✅ تسجيل Observers للكاش التلقائي
        Episode::observe(EpisodeObserver::class);
        Anime::observe(AnimeObserver::class);
        News::observe(NewsObserver::class);
        Category::observe(CategoryObserver::class);
        Season::observe(SeasonObserver::class);

        // مشاركة المستخدم الحالي مع Inertia
        Inertia::share([
            'auth' => function () {
                $user = Auth::user();
                if ($user) {
                    $user->load('roles', 'permissions');
                    $user->roles = $user->roles->pluck('name')->toArray();
                    $user->permissions = $user->permissions->pluck('name')->toArray();
                }
                return $user;
            },
        ]);
    }
}
