<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\RecordController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\MapController;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Response;

Route::middleware('throttle:60,1')->group(function () {
    
    Route::get('/', function () {
        
        return Auth::check() 
        ? redirect()->route('records.index') 
        : redirect()->route('login');
        
    })->name('home');
    
    Route::middleware('auth')->group(function () {
        
        Route::resource('records', RecordController::class);
        
        Route::resource('images', ImageController::class);
        
        Route::get('/map', [MapController::class, 'index'])->name('map.index');
        
    });
    
});

Route::get('/tile/{z}/{x}/{y}.png', function ($z, $x, $y) {
    $subdomains = ['a', 'b', 'c'];
    $s = $subdomains[($x + $y + $z) % count($subdomains)];

    $url = "https://{$s}.tile.openstreetmap.org/{$z}/{$x}/{$y}.png";
    $response = Http::get($url);

    return response($response->body(), 200, [
        'Content-Type' => 'image/png',
        'Cache-Control' => 'public, max-age=31536000', // cache 1 año
    ]);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
