<?php

use App\Http\Controllers\Api\ConfigApiController;
use App\Http\Controllers\Api\ImageApiController;
use App\Http\Controllers\Api\RecordApiController;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ImagePageController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\MapPageController;
use App\Http\Controllers\RecordController;
use App\Models\User;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');


Route::middleware(['auth'])->group(function () {
    
    Route::prefix('/images')->name('images.')->group(function () {
        
        Route::get('/', [ImageController::class, 'index'])->name('index');
        Route::get('/{image}', [ImageController::class, 'show'])->name('show');
        Route::get('/upload', [ImageController::class, 'upload'])->name('upload');
    });
    
    Route::prefix('/records')->name('records.')->group(function () {
        
        Route::get('/', [RecordController::class, 'index'])->name('index');
        Route::get('/{record}', [RecordController::class, 'show'])->name('show');
        Route::get('/create', [RecordController::class, 'create'])->name('create');
        Route::get('/{record}/edit', [RecordController::class, 'edit'])->name('edit');                
    });

    Route::prefix('/config')->name('config.')->group(function () {
        Route::get('/', [ConfigApiController::class, 'index'])->name('index');
    });
    
    Route::get('/map', [MapController::class, 'index'])->name('map.view');
    
    Route::prefix('/api')->name('api.')->group(function () {
        
        Route::prefix('/records')->name('records.')->group(function () {
            
            Route::get('/', [RecordApiController::class, 'index'])->name('index');
            Route::post('/', [RecordApiController::class, 'store'])->name('store');
            Route::put('/{record}', [RecordApiController::class, 'update'])->name('update');
            Route::get('/{record}', [RecordApiController::class, 'show'])->name('show');
            Route::delete('/{record}', [RecordApiController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('/images')->name('images.')->group(function () {
            Route::get('/', [ImageApiController::class, 'index'])->name('index');
            Route::post('/', [ImageApiController::class, 'store'])->name('store');
            Route::put('/{image}', [ImageApiController::class, 'update'])->name('update');
            Route::get('/{image}', [ImageApiController::class, 'show'])->name('show');
            Route::delete('/{image}', [ImageApiController::class, 'destroy'])->name('destroy');
        });

        Route::prefix('/config')->name('config.')->group(function () {
            Route::get('/', [ConfigApiController::class, 'index'])->name('index');
            Route::post('/', [ConfigApiController::class, 'store'])->name('store');
            Route::put('/', [ConfigApiController::class, 'update'])->name('update');
        });

    });
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
