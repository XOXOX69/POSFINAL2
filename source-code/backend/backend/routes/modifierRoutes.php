<?php

use App\Http\Controllers\ModifierController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Item Modifier API Routes
|--------------------------------------------------------------------------
*/

// Modifier Groups
Route::get('/groups', [ModifierController::class, 'getAllGroups']);
Route::get('/groups/{id}', [ModifierController::class, 'getSingleGroup']);
Route::post('/groups', [ModifierController::class, 'createGroup']);
Route::put('/groups/{id}', [ModifierController::class, 'updateGroup']);
Route::delete('/groups/{id}', [ModifierController::class, 'deleteGroup']);

// Individual Modifiers
Route::get('/', [ModifierController::class, 'getAllModifiers']);
Route::post('/', [ModifierController::class, 'createModifier']);
Route::put('/{id}', [ModifierController::class, 'updateModifier']);
Route::delete('/{id}', [ModifierController::class, 'deleteModifier']);

// Product-Modifier assignments
Route::post('/assign-product', [ModifierController::class, 'assignToProduct']);
Route::get('/product/{productId}', [ModifierController::class, 'getProductModifiers']);
