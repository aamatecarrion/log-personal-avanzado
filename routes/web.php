<?php

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
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;

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
        Route::resource('/favorites', FavoriteController::class);
        
    });
    
});

Route::prefix('/admin')->middleware(['auth', 'admin'])->name('admin.')->group(function () {
    Route::resource('user-limits', UserLimitController::class);
    Route::resource('user-management', UserManagementController::class);
});

Route::get('/tiles/{z}/{x}/{y}', function ($z, $x, $y) {
    $path = "tiles/{$z}/{$x}/{$y}.jpg";

    // Si ya está en caché
    if (Storage::exists($path)) {
        return response()->file(storage_path("app/{$path}"), ['Content-Type' => 'image/jpeg']);
    }

    // URL real del tile de Esri (z/y/x, ¡ojo!)
    $esriUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{$z}/{$y}/{$x}";

    try {
        $response = Http::timeout(10)->get($esriUrl);
        if ($response->successful()) {
            Storage::put($path, $response->body());
            return response($response->body(), 200)->header('Content-Type', 'image/jpeg');
        } else {
            return response('Tile no disponible', 404);
        }
    } catch (\Exception $e) {
        return response('Error al descargar el tile', 500);
    }
})->middleware('auth');



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
