<?php

use App\Http\Controllers\DataController;
use App\Http\Controllers\ExperimentController;
use App\Http\Controllers\FavoriteController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RecordController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\ImageProcessingJobController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\UserLimitController;
use App\Http\Controllers\UserManagementController;
use App\Models\UserLimit;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;

Route::middleware('throttle:240,1')->group(function () {
    
    Route::get('/', function () {
        
        return Auth::check() ? redirect()->route('records.index') : redirect()->route('login');
        
    })->name('home');
    
});

Route::middleware('auth')->group(function () {
    
    Route::resource('records', RecordController::class);
    
    Route::get('images/upload',[ImageController::class, 'create'])->name('images.upload');
    Route::resource('images', ImageController::class);
    Route::get('/images/thumbnail/{id}', [ImageController::class, 'showThumbnail'])->name('images.thumbnail');
    
    Route::get('/map', [MapController::class, 'index'])->name('map.index');
    
    Route::prefix('/image-processing')->name('imageprocessing.')->group(function () {
        Route::get('/', [ImageProcessingJobController::class, 'index'])->name('index');
        Route::post('generate-title/{id}',[ImageProcessingJobController::class, 'generateTitle'])->name('generate-title');
        Route::post('generate-description/{id}',[ImageProcessingJobController::class, 'generateDescription'])->name('generate-description');
        Route::post('process-all-failed', [ImageProcessingJobController::class, 'processAllFailed'])->name('process-all-failed');
        Route::put('cancel/{job}', [ImageProcessingJobController::class, 'cancel'])->name('cancel');
    });

    Route::resource('/favorites', FavoriteController::class);
    Route::get('/experiments', [ExperimentController::class, 'index'])->name('experiments.index');
    Route::post('/experiments', [ExperimentController::class, 'update'])->name('experiments.update');

    
});
    

Route::prefix('/admin')->middleware(['auth', 'admin'])->name('admin.')->group(function () {
    Route::resource('user-limits', UserLimitController::class);
    Route::resource('user-management', UserManagementController::class);
    
    Route::prefix('/data')->name('data.')->group(function () {
        Route::get('/', [DataController::class, 'index'])->name('index');
        Route::post('/import', [DataController::class, 'import'])->name('import');
        Route::get('/export', [DataController::class, 'export'])->name('export');
    });
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
