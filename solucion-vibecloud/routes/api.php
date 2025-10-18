<?php

use App\Http\Controllers\zonesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AWSController;
use App\Http\Controllers\GeminiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/predict', [AWSController::class, 'predictWithSageMaker']);
Route::post('/predictTaxis', [AWSController::class, 'predict']);
Route::post('/predict-test', [AWSController::class, 'predictTest']); // Ruta de prueba sin AWS
Route::get('/getZones', [zonesController::class, 'getZones'])->name('getZones');
Route::get('/getZones/{id}', [zonesController::class, 'getZoneById'])->name('getZoneById');

// rutas para obtener datos historicos
Route::get('/getPriceAverageDo/{year}/{month}', [AWSController::class, 'averagePerZoneDoLocation'])->name('getHistoricalDataDo');
Route::get('/getPriceAveragePu/{year}/{month}', [AWSController::class, 'averagePerZonePuLocation'])->name('getHistoricalDataPu');

// Ruta para datos del dashboard
Route::get('/dashboard-data', [AWSController::class, 'dashboardData'])->name('dashboardData');
Route::get('/stats-data', [AWSController::class, 'statsData'])->name('statsData');
Route::get('/test', [AWSController::class, 'test'])->name('test');

// Ruta para Gemini AI
Route::post('/gemini/query', [GeminiController::class, 'processQuery'])->name('gemini.query');