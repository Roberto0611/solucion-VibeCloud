<?php

use Illuminate\Support\Facades\Route;
use Aws\SageMakerRuntime\SageMakerRuntimeClient;
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

Route::get('/sm-test', function () {
    $client = new SageMakerRuntimeClient([
        'version' => '2017-05-13',
        'region'  => env('AWS_REGION', 'us-east-1'),
        // El SDK usará AWS_ACCESS_KEY_ID/SECRET del .env o el perfil por defecto
        'http'    => ['timeout' => 10, 'connect_timeout' => 3],
    ]);

    $payload = [
        'instances' => [[
            'pickup_dt_str' => '2024-12-15 08:30:00',
            'pulocationid'  => 132,
            'dolocationid'  => 235,
            'trip_miles'    => 3.2,
            // 'include_interval' => true,
        ]],
    ];

    $res = $client->invokeEndpoint([
        'EndpointName' => env('SM_ENDPOINT_NAME'),
        'ContentType'  => 'application/json',
        'Accept'       => 'application/json',
        'Body'         => json_encode($payload, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES),
    ]);

    return response((string) $res->get('Body'), 200)->header('Content-Type', 'application/json');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
