<?php

namespace App\Observers;

use App\Events\ImageProcessingJobUpdate;
use App\Models\ImageProcessingJob;

class ImageProcessingJobObserver
{
    /**
     * Handle the ImageProcessingJob "created" event.
     */
    public function created(ImageProcessingJob $job): void
    {
        $job->load('image.record.user');

        ImageProcessingJobUpdate::dispatch($job);
    }

    /**
     * Handle the ImageProcessingJob "updated" event.
     */
    public function updated(ImageProcessingJob $job): void
    {
        $job->load('image.record.user');

        ImageProcessingJobUpdate::dispatch($job);
    }

    /**
     * Handle the ImageProcessingJob "deleted" event.
     */
    public function deleted(ImageProcessingJob $job): void
    {
        $job->load('image.record.user');

        ImageProcessingJobUpdate::dispatch($job);
    }

    /**
     * Handle the ImageProcessingJob "restored" event.
     */
    public function restored(ImageProcessingJob $imageProcessingJob): void
    {
        //
    }

    /**
     * Handle the ImageProcessingJob "force deleted" event.
     */
    public function forceDeleted(ImageProcessingJob $imageProcessingJob): void
    {
        //
    }
}
