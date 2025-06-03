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
use Illuminate\Support\Facades\Storage;

class GenerateImageTitle implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $image;

    public function __construct(Image $image)
    {
        $this->image = $image;

        // Crear el registro con queued_at = ahora, si no existe ya
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

            $response = Http::timeout(240)->post('http://' . env('OLLAMA_HOST') . ':' . env('OLLAMA_PORT') . '/api/generate', [
                'model' => env('OLLAMA_MODEL'),
                'prompt' => 'describe esta imagen en menos de 10 palabras (no digas cosas que formen parte de una conversación cómo: aquí hay una descripción, por supuesto o Claro! te describiré la imagen )',
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
            
        } catch (\Throwable $e) {
            $job->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
                'finished_at' => now()
            ]);
        }
    }
}
