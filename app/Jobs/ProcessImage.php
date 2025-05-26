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
            if (!is_string($this->image->image_path) || empty($this->image->image_path)) throw new \Exception("El path de la imagen no es válido");

            if (!Storage::disk('private')->exists($this->image->image_path)) throw new \Exception("Archivo de imagen no encontrado");

            $rawImage = Storage::disk('private')->get($this->image->image_path);

            $info = getimagesizefromstring($rawImage);
            if ($info === false) {
                throw new \Exception("La imagen no es válida o está corrupta");
            }

            $imageData = base64_encode($rawImage);

            $response = Http::timeout(240)->post('http://192.168.1.20:11434/api/generate', [
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

            $this->image->update([
                'generated_description' => $generated_description
            ]);

            $response = Http::timeout(240)->post('http://192.168.1.20:11434/api/generate', [
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
                throw new \Exception("La IA no generó una descripción válida");
            }

            // Sanitizar y truncar respuesta
            $generated_title = substr(strip_tags($responseData['response']), 0, 2000);

            // Actualizar el título del registro asociado
            $this->image->record->update([
                'title' => $generated_title,
            ]);

        } catch (\Exception $e) {
            Log::error("Error procesando imagen {$this->image->id}", [
                'error' => $e->getMessage(),
                'path' => $this->image->image_path
            ]);
            
            throw $e;
        }
    }
}
