<?php

use App\Http\Controllers\MapPageController;
use App\Http\Controllers\RecordController;
use App\Http\Controllers\RecordPageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth'])->group(function () {
    Route::get('/records', [RecordPageController::class, 'index'])->name('records.view');
    Route::get('/records/create', [RecordPageController::class, 'create'])->name('records.create');
    Route::get('/records/{record}', [RecordPageController::class, 'show'])->name('records.show');
    Route::get('/map', [MapPageController::class, 'index'])->name('map.view');

    Route::prefix('api')->name('api.')->group(function () {
        Route::get('/records', [RecordController::class, 'index'])->name('records.index');
        Route::post('/records', [RecordController::class, 'store'])->name('records.store');
        Route::get('/records/{record}', [RecordController::class, 'show'])->name('records.show');
        Route::put('/records/{record}', [RecordController::class, 'update'])->name('records.update');
        Route::delete('/records/{record}', [RecordController::class, 'destroy'])->name('records.destroy');
    });
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
