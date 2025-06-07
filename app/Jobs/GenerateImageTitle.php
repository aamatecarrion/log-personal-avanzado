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

class GenerateImageTitle implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $image;

    public function __construct(Image $image)
    {   

        $this->image = $image;
        
        ImageProcessingJob::updateOrCreate([
            'image_id' => $image->id,
            'type' => 'title',
        ], [
            'status' => 'pending',
            'queued_at' => now(),
        ]);
    }

    public function handle()
    {   
        $job = ImageProcessingJob::where('image_id', $this->image->id)
                                 ->where('type', 'title')
                                 ->first();

        if (!$job) {
            Log::error("No se encontró el registro de ImageProcessingJob para la imagen ID {$this->image->id}");
            return;
        }
        if ($job->status === 'cancelled') return;

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

            if ($dayliLimit !== null && RateLimiter::attempts($key) >= $dayliLimit) {
                $job->update([
                    'status' => 'pending',
                    'queued_at' => now(),
                ]);
                return;
            }

            $rawImage = Storage::disk('private')->get($this->image->image_path);
            
            $info = getimagesizefromstring($rawImage);
            if ($info === false) {
                throw new \Exception("La imagen no es válida o está corrupta");
            }
            
            $imageData = base64_encode($rawImage);
            
            if ($job->fresh()->status === 'cancelled' ) return;
            
            $job->update([
                'status' => 'processing',
                'started_at' => now(),
            ]);


            $response = Http::timeout(240)->post('http://127.0.0.1:11434/api/generate', [
                'model' => env('OLLAMA_MODEL'),
                'prompt' => 'describe esta imagen en menos de 10 palabras (la salida se incluirá en el alt de una imagen, no digas cosas que formen parte de una conversación cómo: aquí hay una descripción, por supuesto o Claro! te describiré la imagen )',
                'images' => [$imageData],
                'stream' => false,
            ]);

            // Verificar errores HTTP primero
            if ($response->failed()) throw new \Exception("Error en la API: " . $response->body());
            // Validar respuesta JSON
            $responseData = $response->json();
            if (empty($responseData['response'])) {
                Log::error("Respuesta vacía", ['response' => $responseData]);
                throw new \Exception("La IA no generó un título válido");
            }

            // Sanitizar y truncar respuesta
            $generated_title = substr(strip_tags($responseData['response']), 0, 2000);

            // Actualizar el título del registro asociado
            $this->image->record->update([
                'title' => $generated_title,
            ]);

            $job->update([
                'status' => 'completed',
                'finished_at' => now()
            ]);
            RateLimiter::hit("user:{$this->image->record->user_id}:daily_image_process", 60 * 60 * 24);
            
        } catch (\Throwable $e) {
            $job->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
                'finished_at' => now()
            ]);
        }
    }
}
