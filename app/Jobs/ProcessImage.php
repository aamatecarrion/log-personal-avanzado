<?php

namespace App\Jobs;

use App\Models\Image;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessImage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [5, 10, 15];  // Backoff progresivo para reintentos
    public $timeout = 300;           // Timeout específico para el job

    public function __construct(public Image $image)
    {
    }

    public function handle()
    {
        try {
            if (!is_string($this->image->image_path) || empty($this->image->image_path)) {
                throw new \Exception("El path de la imagen no es válido");
            }

            if (!Storage::disk('private')->exists($this->image->image_path)) {
                throw new \Exception("Archivo de imagen no encontrado");
            }


            // Convertir a base64
            $imageData = base64_encode(Storage::disk('private')->get($this->image->image_path));

            $response = Http::timeout(240)->post('http://localhost:11434/api/generate', [
                'model' => 'moondream:latest',
                'prompt' => '¿Qué hay en esta imagen?.',
                'images' => [$imageData],
                'stream' => false,
                'options' => [
                    'temperature' => 0.4,  // Valor más balanceado
                    'num_predict' => 512,  // Longitud máxima de respuesta
                    'num_ctx' => 4096
                ]
            ]);

            // Verificar errores HTTP primero
            if ($response->failed()) {
                throw new \Exception("Error en la API: " . $response->body());
            }

            // Validar respuesta JSON
            $responseData = $response->json();
            if (empty($responseData['response'])) {
                Log::error("Respuesta vacía", ['response' => $responseData]);
                throw new \Exception("La IA no generó una descripción válida");
            }

            // Sanitizar y truncar respuesta
            $generated_description = substr(strip_tags($responseData['response']), 0, 2000);

            $this->image->update([
                'generated_description' => $generated_description
            ]);

            // Actualizar el título del registro asociado
            $this->image->record->update([
                'title' => (mb_strlen($generated_description, 'UTF-8') > 20) 
                    ? mb_substr($generated_description, 0, 17, 'UTF-8') . '...' 
                    : $generated_description,
            ]);

        } catch (\Exception $e) {
            Log::error("Error procesando imagen {$this->image->id}", [
                'error' => $e->getMessage(),
                'path' => $this->image->image_path
            ]);
            
            $this->image->update(['status' => 'failed']);
            throw $e;
        }
    }
}
