<?php

namespace App\Console\Commands;

use App\Jobs\GenerateImageDescription;
use App\Jobs\GenerateImageTitle;
use App\Models\Image;
use App\Jobs\ProcessImage;
use Illuminate\Console\Command;

class ProcessPendingImages extends Command
{
    protected $signature = 'images:process';
    protected $description = 'Añade a la cola las imágenes pendientes de procesar';

    public function handle()
    {
        $images = Image::where(function ($query) {
            $query->whereNull('generated_description')
                  ->orWhere('generated_description', '');
        })->get();

        foreach ($images as $image) {
            GenerateImageTitle::dispatch($image);
            GenerateImageDescription::dispatch($image);
            $this->info("Imagen {$image->id} añadida a la cola");
        }

        $this->info("Total de imágenes añadidas a la cola: {$images->count()}");
    }
}
