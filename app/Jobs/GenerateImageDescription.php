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

class GenerateImageDescription implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $image;

    public function __construct(Image $image)
    {
        $this->image = $image;

        // Crear el registro con queued_at = ahora, si no existe ya
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
        $job = ImageProcessingJob::where('image_id', $this->image->id)
                                 ->where('type', 'description')
                                 ->first();

        if (!$job) {
            Log::error("No se encontró el registro de ImageProcessingJob para la imagen ID {$this->image->id}");
            return;
        }

        $job->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);

        try {
            $rawImage = Storage::disk('private')->get($this->image->image_path);

            $info = getimagesizefromstring($rawImage);
            if ($info === false) {
                throw new \Exception("La imagen no es válida o está corrupta");
            }

            $imageData = base64_encode($rawImage);

            $response = Http::timeout(240)->post('http://' . env('OLLAMA_HOST') . ':' . env('OLLAMA_PORT') . '/api/generate', [
                'model' => env('OLLAMA_MODEL'),
                'prompt' => 'genera una descripción para esta imagen, (no digas cosas que formen parte de una conversación cómo: aquí hay una descripción, por supuesto o Claro! te describiré la imagen )',
                'images' => [$imageData],
                'stream' => false
            ]);

            // Verificar errores HTTP primero
            if ($response->failed()) throw new \Exception("Error en la API: " . $response->body());

            // Validar respuesta JSON
            $responseData = $response->json();
            if (empty($responseData['response'])) {
                Log::error("Respuesta vacía", ['response' => $responseData]);
                throw new \Exception("La IA no generó una descripción válida");
            }

            // Sanitizar y truncar respuesta
            $generated_description = substr(strip_tags($responseData['response']), 0, 2000);

            $this->image->update(['generated_description' => $generated_description]);

            $job->update([
                'status' => 'completed',
                'error' => null,
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
