<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::get('ar/settings/profile', [ProfileController::class, 'aredit'])->name('ar.profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::patch('ar/settings/profile', [ProfileController::class, 'arupdate'])->name('ar.profile.update');

    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::get('ar/settings/password', [PasswordController::class, 'aredit'])->name('ar.password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/Appearance');
    })->name('appearance');

        Route::get('ar/settings/appearance', function () {
        return Inertia::render('settings/ar-Appearance');
    })->name('ar.appearance');
});


