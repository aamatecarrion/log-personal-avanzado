<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RecordController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\MapController;


Route::middleware('throttle:60,1')->group(function () {
    
    Route::get('/', function () {
        
        return Auth::check() 
        ? redirect()->route('records.index') 
        : redirect()->route('login');
        
    })->name('home');
        
    Route::middleware('auth')->group(function () {
        
        Route::resource('records', RecordController::class);
        
        Route::resource('images', ImageController::class);
        
        Route::get('/map', [MapController::class, 'index'])->name('map.view');
        
    });
    
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
