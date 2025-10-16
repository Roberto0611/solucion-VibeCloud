<?php

use App\Http\Controllers\AWSController;
use App\Http\Controllers\CSVImportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

## landing page
Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

# componente de la tierra
Route::get('/earth', function () {
    return Inertia::render('earthpage');
})->name('earthpage');

# prueba de json (preguntar si eliminar a Aldo)
Route::get('/prueba', function () {
    return Inertia::render('prueba');
})->name('prueba');

# rutas del dashboard (EN UN FUTURO OPTIMIZARLO CON EL CONTROLADOR)
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
    Route::get('/download', function () {
        return Inertia::render('DownloadPage');
    })->name('download');
    Route::get('/profile', function () {
        return Inertia::render('ProfilePage');
    })->name('profile');
    Route::get('/record', function () {
        return Inertia::render('RecordPage');
    })->name('record');
    Route::get('/stats', function () {
        return Inertia::render('StatsPage');
    })->name('stats');
});

# prueba de aws sagemaker
Route::get('/sm-test', [AWSController::class, 'smTest'])->name('smTest');

# cargar csv
Route::get('/import-csv', [CSVImportController::class, 'import'])->name('import.csv');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
