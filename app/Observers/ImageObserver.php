<?php

namespace App\Observers;

use App\Events\RecordsUpdate;
use App\Models\Image;

class ImageObserver
{
    /**
     * Handle the Image "created" event.
     */
    public function created(Image $image): void
    {
        // Carga las relaciones para no hacer muchas consultas
        $image->load('record.user');

        $userId = $image->record->user->id;

        // Dispara el evento para ese usuario
        RecordsUpdate::dispatch($userId);
    }

    /**
     * Handle the Image "updated" event.
     */
    public function updated(Image $image): void
    {
        $image->load('record.user');

        $userId = $image->record->user->id;

        // Dispara el evento para ese usuario
        RecordsUpdate::dispatch($userId);
    }

    /**
     * Handle the Image "deleted" event.
     */
    public function deleted(Image $image): void
    {
        $image->load('record.user');

        $userId = $image->record->user->id;

        // Dispara el evento para ese usuario
        RecordsUpdate::dispatch($userId);
    }

    /**
     * Handle the Image "restored" event.
     */
    public function restored(Image $image): void
    {
        //
    }

    /**
     * Handle the Image "force deleted" event.
     */
    public function forceDeleted(Image $image): void
    {
        //
    }
}
