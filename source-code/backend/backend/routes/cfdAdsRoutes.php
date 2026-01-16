<?php

use App\Http\Controllers\CfdAdvertisementController;
use Illuminate\Support\Facades\Route;

// All CFD routes are public for now (can add auth later for production)
Route::get('/active', [CfdAdvertisementController::class, 'getActive']);
Route::get('/', [CfdAdvertisementController::class, 'index']);
Route::get('/{id}', [CfdAdvertisementController::class, 'show'])->where('id', '[0-9]+');
Route::post('/', [CfdAdvertisementController::class, 'store']);
Route::post('/{id}', [CfdAdvertisementController::class, 'update'])->where('id', '[0-9]+');
Route::delete('/{id}', [CfdAdvertisementController::class, 'destroy'])->where('id', '[0-9]+');
Route::post('/update-order', [CfdAdvertisementController::class, 'updateOrder']);
Route::patch('/{id}/toggle', [CfdAdvertisementController::class, 'toggleActive'])->where('id', '[0-9]+');
