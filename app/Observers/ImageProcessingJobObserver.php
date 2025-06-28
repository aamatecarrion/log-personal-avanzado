<?php

namespace App\Observers;

use App\Events\RecordsUpdate;
use App\Models\ImageProcessingJob;

class ImageProcessingJobObserver
{
    /**
     * Handle the ImageProcessingJob "created" event.
     */
    public function created(ImageProcessingJob $job): void
    {
        // Carga las relaciones para no hacer muchas consultas
        $job->load('image.record.user');

        $userId = $job->image->record->user->id;

        // Dispara el evento para ese usuario
        RecordsUpdate::dispatch($userId);
    }

    /**
     * Handle the ImageProcessingJob "updated" event.
     */
    public function updated(ImageProcessingJob $job): void
    {
        // Carga las relaciones para no hacer muchas consultas
        $job->load('image.record.user');

        $userId = $job->image->record->user->id;

        // Dispara el evento para ese usuario
        RecordsUpdate::dispatch($userId);
    }

    /**
     * Handle the ImageProcessingJob "deleted" event.
     */
    public function deleted(ImageProcessingJob $job): void
    {
        $job->load('image.record.user');

        $userId = $job->image->record->user->id;

        // Dispara el evento para ese usuario
        RecordsUpdate::dispatch($userId);
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
