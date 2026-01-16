<?php

use App\Http\Controllers\CashDrawerController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Cash Drawer API Routes
|--------------------------------------------------------------------------
*/

Route::get('/current', [CashDrawerController::class, 'getCurrentDrawer']);
Route::post('/open', [CashDrawerController::class, 'openDrawer']);
Route::post('/{id}/close', [CashDrawerController::class, 'closeDrawer']);
Route::post('/cash-in', [CashDrawerController::class, 'cashIn']);
Route::post('/cash-out', [CashDrawerController::class, 'cashOut']);
Route::post('/sale', [CashDrawerController::class, 'recordSale']);
Route::get('/history', [CashDrawerController::class, 'getDrawerHistory']);
Route::get('/{id}', [CashDrawerController::class, 'getDrawer']);
Route::get('/{id}/transactions', [CashDrawerController::class, 'getDrawerTransactions']);
