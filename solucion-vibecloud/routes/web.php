<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/earth', function () {
    return Inertia::render('earthpage');
})->name('earthpage');

Route::get('/prueba', function () {
    return Inertia::render('prueba');
})->name('prueba');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('main', function () {
        return Inertia::render('MainPage');
    })->name('MainPage');

    Route::get('/dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    Route::get('/schedule', function () {
        return Inertia::render('CalendarPage');
    })->name('schedule');
    Route::get('/map', function () {
        return Inertia::render('MapPage');
    })->name('map');
    Route::get('/charts', function () {
        return Inertia::render('ChartsPage');
    })->name('charts');
    Route::get('/profile', function () {
        return Inertia::render('ProfilePage');
    })->name('profile');
    Route::get('/record', function () {
        return Inertia::render('RecordPage');
    })->name('record');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
