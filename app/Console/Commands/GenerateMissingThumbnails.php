<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Image;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image as InterventionImage;
use Intervention\Image\Encoders\JpegEncoder;

class GenerateMissingThumbnails extends Command
{
    protected $signature = 'images:generate-thumbnails';
    protected $description = 'Generar miniaturas para imágenes que no las tienen';

    public function handle()
    {
        Storage::disk('private')->makeDirectory('thumbnails');
        
        $images = Image::all();
        $bar = $this->output->createProgressBar($images->count());
        $bar->start();

        foreach ($images as $image) {
            try {
                $thumbnailPath = 'thumbnails/' . basename($image->image_path);
                
                // Solo generar si no existe miniatura
                if (!Storage::disk('private')->exists($thumbnailPath)) {
                    $imagePath = Storage::disk('private')->path($image->image_path);
                    $thumbFullPath = Storage::disk('private')->path($thumbnailPath);
                    
                    if (Storage::disk('private')->exists($image->image_path)) {
                        InterventionImage::read($imagePath)
                            ->scaleDown(300, 300)
                            ->encode(new JpegEncoder(quality: 80))
                            ->save($thumbFullPath);
                    }
                    if (file_exists($thumbFullPath)) {
                        @chmod($thumbFullPath, 0644);
                    }
                }
            } catch (\Exception $e) {
                $this->error("Error ID {$image->id}: " . $e->getMessage());
            }
            $bar->advance();
        }

        $bar->finish();
        $this->info("\nMiniaturas generadas!");
        $this->cleanOrphanThumbnails();
    }

    private function cleanOrphanThumbnails()
    {
        $this->info("\nLimpiando miniaturas huérfanas...");
        $allThumbs = Storage::disk('private')->allFiles('thumbnails');
        $deletedCount = 0;

        foreach ($allThumbs as $thumb) {
            // Verificar si existe imagen original
            $originalPath = str_replace('thumbnails/', 'images/', $thumb);
            
            if (!Storage::disk('private')->exists($originalPath)) {
                Storage::disk('private')->delete($thumb);
                $deletedCount++;
            }
        }

        $this->info("Miniaturas eliminadas: {$deletedCount}");
    }
}