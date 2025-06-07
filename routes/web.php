<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RecordController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ImageProcessingJobController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\UserLimitController;
use App\Http\Controllers\UserManagementController;

Route::middleware('throttle:240,1')->group(function () {
    
    Route::get('/', function () {
        
        return Auth::check() ? redirect()->route('records.index') : redirect()->route('login');
        
    })->name('home');
    
    Route::middleware('auth')->group(function () {
        
        Route::resource('records', RecordController::class);
        
        Route::get('images/upload',[ImageController::class, 'create'])->name('images.upload');
        Route::resource('images', ImageController::class);
        
        Route::get('/map', [MapController::class, 'index'])->name('map.index');
        Route::get('/image-processing', [ImageProcessingJobController::class, 'index'])->name('imageprocessing.index');
        Route::post('/image-processing/generate-title/{id}',[ImageProcessingJobController::class, 'generateTitle'])->name('imageprocessing.generate-title');
        Route::post('/image-processing/generate-description/{id}',[ImageProcessingJobController::class, 'generateDescription'])->name('imageprocessing.generate-description');
        Route::put('/image-processing/{job}', [ImageProcessingJobController::class, 'cancel'])->name('imageprocessing.cancel');
        
    });
    
});

Route::prefix('/admin')->middleware(['auth', 'admin'])->name('admin.')->group(function () {
    Route::resource('user-limits', UserLimitController::class);
    Route::resource('user-management', UserManagementController::class);
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
