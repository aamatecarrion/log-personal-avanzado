<?php

use App\Http\Controllers\ConfigController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ImagePageController;
use App\Http\Controllers\MapPageController;
use App\Http\Controllers\RecordController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth'])->group(function () {
    Route::get('/records', [RecordController::class, 'index'])->name('records.index');
    Route::get('/records/create', [RecordController::class, 'create'])->name('records.create');
    Route::post('/records', [RecordController::class, 'store'])->name('records.store');
    Route::get('/records/{record}/edit', [RecordController::class, 'edit'])->name('records.edit');
    Route::put('/records/{record}', [RecordController::class, 'update'])->name('records.update');
    Route::delete('/records/{record}', [RecordController::class, 'destroy'])->name('records.destroy');
    Route::get('/records/{record}', [RecordController::class, 'show'])->name('records.show');
        
    Route::get('/images/upload', [ImagePageController::class, 'upload'])->name('images.upload');
    Route::get('/images', [ImagePageController::class, 'index'])->name('images.index');
    Route::get('/images/{image}', [ImagePageController::class, 'show'])->name('images.show');

    Route::get('/map', [MapPageController::class, 'index'])->name('map.view');
    
    Route::prefix('api')->name('api.')->group(function () {
        
        Route::post('/images', [ImageController::class, 'store'])->name('images.store');
        Route::get('/images/{image}', [ImageController::class, 'show'])->name('images.show');
        
        Route::get('/config', [ConfigController::class, 'index'])->name('preferences.index');
        Route::put('/config', [ConfigController::class, 'update'])->name('preferences.update');
    });
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
