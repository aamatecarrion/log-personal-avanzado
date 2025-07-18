<?php

namespace App\Providers;

use App\Http\Middleware\AdminMiddleware;
use App\Models\Base\Image;
use App\Models\ImageProcessingJob;
use App\Models\Record;
use App\Observers\ImageProcessingJobObserver;
use App\Observers\RecordObserver;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Route::aliasMiddleware('admin', AdminMiddleware::class);
        
        Record::observe(RecordObserver::class);
        ImageProcessingJob::observe(ImageProcessingJobObserver::class);
    }
}
