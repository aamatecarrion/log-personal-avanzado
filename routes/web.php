<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ConfigController;
use App\Http\Controllers\RecordController;
use App\Http\Controllers\ImageController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\Api\ConfigApiController;
use App\Http\Controllers\Api\RecordApiController;
use App\Http\Controllers\Api\ImageApiController;
use App\Http\Controllers\Api\MapApiController;

use Inertia\Inertia;



Route::get('/', function () {

    if (Auth::check()) {
        return redirect()->route('records.index');
    }
    else {
        return redirect()->route('login');
    }

    return Inertia::render('welcome');

})->name('home');


Route::middleware(['auth'])->group(function () {
   
    Route::resource('records', RecordController::class);
    
    Route::resource('images', ImageController::class);
    
    Route::get('/map', [MapController::class, 'index'])->name('map.view');
    
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
