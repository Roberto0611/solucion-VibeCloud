<?php

use App\Http\Controllers\zonesController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AWSController;

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

Route::post('/predict', [AWSController::class, 'predict']);
Route::post('/predict-test', [AWSController::class, 'predictTest']); // Ruta de prueba
Route::get('/getZones', [zonesController::class, 'getZones'])->name('getZones');
Route::get('/getZones/{id}', [zonesController::class, 'getZoneById'])->name('getZoneById');