<?php

namespace App\Jobs;

use App\Models\Image;
use App\Models\ImageProcessingJob;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;

class GenerateImageDescription implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $image;

    public function __construct(Image $image)
    {
        
        $this->image = $image;

        ImageProcessingJob::updateOrCreate([
            'image_id' => $image->id,
            'type' => 'description',
        ], [
            'status' => 'pending',
            'queued_at' => now(),
        ]);
    }

    public function handle()
    {
        Log::info("Iniciando job para imagen ID {$this->image->id}");

        $job = ImageProcessingJob::where('image_id', $this->image->id)
                                 ->where('type', 'description')
                                 ->first();

        if (!$job) {
            Log::error("No se encontró el registro de ImageProcessingJob para la imagen ID {$this->image->id}");
            return;
        }
        
        if ($job->status === 'cancelled') {
            Log::info("Job cancelado para imagen ID {$this->image->id}");
            return;
        }

        try {
            $user = $this->image->record->user;
            if ($user->user_limit && !$user->user_limit?->can_process_images) {
                $job->update([
                    'status' => 'cancelled',
                    'finished_at' => now(),
                ]);
                return; 
            }
            $dayliLimit = $user->user_limit?->daily_process_limit;
            $key = "user:{$user->id}:daily_image_process";

            $dayliLimit = $user->user_limit?->daily_process_limit;
            $key = "user:{$user->id}:daily_image_process";

            if ($dayliLimit !== null && RateLimiter::attempts($key) >= $dayliLimit) {
                $job->update([
                    'status' => 'cancelled',
                    'finished_at' => now(),
                ]);
                return; 
            }
           
            $path = $this->image->image_path;
            $disk = Storage::disk('private');

            Log::info("Probando acceso a {$path}");
            Log::info("Ruta absoluta: " . $disk->path($path));

            if (!$disk->exists($path)) {
                Log::error("No existe el archivo en el disco privado.");
                return;
            }

            $rawImage = $disk->get($path);

            if (!$rawImage) {
                Log::error("No se pudo leer el contenido de la imagen.");
                return;
            }
            
            $imageData = base64_encode($rawImage);
            Log::info('Base64 preview: ' . substr($imageData, 0, 30));

            Log::info("Actualizando estado a processing");
            $updated = ImageProcessingJob::where('id', $job->id)
                ->where('status', 'pending')
                ->update([
                    'status' => 'processing',
                    'started_at' => now(),
                ]);

            if (!$updated) {
                Log::info("El job ya no está pending, se cancela ejecución");
                return;
            }

            Log::info("Enviando petición a la API de generación");
            $response = Http::timeout(240)->post('http://' . env('OLLAMA_HOST') . ':11434/api/generate', [
                'model' => env('OLLAMA_MODEL'),
                'prompt' => 'genera una descripción para esta imagen, (la salida se incluirá en el alt de una imagen, no digas cosas que formen parte de una conversación cómo: aquí hay una descripción, por supuesto o Claro! te describiré la imagen )',
                'images' => [$imageData],
                'stream' => false
            ]);

            if ($response->failed()) {
                Log::error("Error en la API: " . $response->body());
                throw new \Exception("Error en la API: " . $response->body());
            }

            $responseData = $response->json();
            if (empty($responseData['response'])) {
                Log::error("Respuesta vacía de la API", ['response' => $responseData]);
                throw new \Exception("La IA no generó una descripción válida");
            }

            $generated_description = substr(strip_tags($responseData['response']), 0, 2000);
            Log::info("Descripción generada: " . $generated_description);

            $this->image->update(['generated_description' => $generated_description]);

            $job->update([
                'status' => 'completed',
                'error' => null,
                'finished_at' => now()
            ]);
            RateLimiter::hit("user:{$this->image->record->user_id}:daily_image_process", 60 * 60 * 24);

            Log::info("Job completado correctamente para imagen ID {$this->image->id}");

        } catch (\Throwable $e) {
            
            Log::error("Error procesando descripción para imagen ID {$this->image->id}: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);
            $job->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
                'finished_at' => now()
            ]);
        }
    }

}
