<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any authentication / authorization services.
     */
    public function boot(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Posts
        |--------------------------------------------------------------------------
        */
        Gate::define('create-post-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('create-post')
        );

        Gate::define('update-post-or-admin', fn($user, $post = null) =>
            $user->hasRole('admin') || $user->hasPermissionTo('update-post')
        );

        Gate::define('delete-post-or-admin', fn($user, $post = null) =>
            $user->hasRole('admin') || $user->hasPermissionTo('delete-post')
        );

        Gate::define('page-post-or-admin', fn($user, $post = null) =>
            $user->hasRole('admin') || $user->hasPermissionTo('page-post')
        );

        /*
        |--------------------------------------------------------------------------
        | Types
        |--------------------------------------------------------------------------
        */
        Gate::define('create-type-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('create-type')
        );

        Gate::define('update-type-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('update-type')
        );

        Gate::define('delete-type-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('delete-type')
        );

        Gate::define('page-type-or-admin', fn($user, $type = null) =>
            $user->hasRole('admin') || $user->hasPermissionTo('page-type')
        );

        /*
        |--------------------------------------------------------------------------
        | Categories
        |--------------------------------------------------------------------------
        */
        Gate::define('page-category-or-admin', fn($user, $category = null) =>
            $user->hasRole('admin') || $user->hasPermissionTo('page-category')
        );


        Gate::define('create-category-or-admin', fn($user) =>
        $user->hasRole('admin') || $user->hasPermissionTo('create-category')
    );

        /*
        |--------------------------------------------------------------------------
        | Seasons
        |--------------------------------------------------------------------------
        */
        Gate::define('create-season-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('create-season')
        );

        Gate::define('update-season-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('update-season')
        );

        Gate::define('delete-season-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('delete-season')
        );

        Gate::define('page-season-or-admin', fn($user, $season = null) =>
            $user->hasRole('admin') || $user->hasPermissionTo('page-season')
        );

        /*
        |--------------------------------------------------------------------------
        | Studios
        |--------------------------------------------------------------------------
        */
        Gate::define('create-studio-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('create-studio')
        );

        Gate::define('update-studio-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('update-studio')
        );

        Gate::define('delete-studio-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('delete-studio')
        );

        Gate::define('page-studio-or-admin', fn($user, $studio = null) =>
            $user->hasRole('admin') || $user->hasPermissionTo('page-studio')
        );

        /*
        |--------------------------------------------------------------------------
        | Languages
        |--------------------------------------------------------------------------
        */
        Gate::define('create-language-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('create-language')
        );

        Gate::define('update-language-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('update-language')
        );

        Gate::define('delete-language-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('delete-language')
        );

        Gate::define('page-language-or-admin', fn($user, $language = null) =>
            $user->hasRole('admin') || $user->hasPermissionTo('page-language')
        );

        /*
        |--------------------------------------------------------------------------
        | Management (Users, Roles, Permissions)
        |--------------------------------------------------------------------------
        */
        Gate::define('manage-users-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('manage-users')
        );

        Gate::define('manage-roles-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('manage-roles')
        );

        Gate::define('manage-permissions-or-admin', fn($user) =>
            $user->hasRole('admin') || $user->hasPermissionTo('manage-permissions')
        );
        Gate::define('dashboard-access', fn($user) =>
    $user->hasRole('admin') ||
    $user->hasRole('assistant') ||
    $user->hasRole('Admin Assistant')
);

    }


    
}
