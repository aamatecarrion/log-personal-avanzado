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
            throw new \Exception("No se encontró el job de procesamiento para la imagen ID {$this->image->id}");
        }

        if ($job->status === 'cancelled') {
            Log::info("Job cancelado para imagen ID {$this->image->id}");
            return;
        }

        try {
            $user = $this->image->record->user;
            if ($user->user_limit && !$user->user_limit?->can_process_images) {
                throw new \Exception("El usuario {$user->id} no puede procesar imágenes");
            }

            $dayliLimit = $user->user_limit?->daily_process_limit;
            $key = "user:{$user->id}:daily_image_process";

            if ($dayliLimit !== null && RateLimiter::attempts($key) >= $dayliLimit) {
                throw new \Exception("Límite diario de procesamiento de imágenes alcanzado para el usuario ID {$user->id}");
            }

            $path = $this->image->image_path;
            $disk = Storage::disk('private');

            Log::info("Probando acceso a {$path}");
            Log::info("Ruta absoluta: " . $disk->path($path));

            if (!$disk->exists($path)) {
                throw new \Exception("El archivo de imagen no existe en el disco privado.");
            }

            $rawImage = $disk->get($path);
            if (!$rawImage) {
                throw new \Exception("No se pudo leer el contenido de la imagen.");
            }

            $imageData = base64_encode($rawImage);
            Log::info('Base64 preview: ' . substr($imageData, 0, 30));

            Log::info("Actualizando estado a processing");
            $updated = ImageProcessingJob::where('id', $job->id)
                ->where('status', 'pending')
                ->update([
                    'status'     => 'processing',
                    'started_at' => now(),
                ]);

            if (!$updated) {
                throw new \Exception("El job ya no está pending, se cancela ejecución");
            }

            // 🚀 Usamos config/ollama.php en vez de env()
            $ollamaConnections = config('ollama.connections');

            $response  = null;
            $lastError = null;

            foreach ($ollamaConnections as $conn) {
                try {
                    $url = "http://{$conn['host']}:{$conn['port']}/api/generate";
                    Log::info("Intentando conexión con OLLAMA en {$url} usando modelo {$conn['model']}");

                    $response = Http::timeout(240)->post($url, [
                        'model'  => $conn['model'],
                        'prompt' => 'genera una descripción para esta imagen, (la salida se incluirá en el alt de una imagen, no digas cosas que formen parte de una conversación cómo: aquí hay una descripción, por supuesto o Claro! te describiré la imagen )',
                        'images' => [$imageData],
                        'stream' => false,
                    ]);

                    if ($response->successful()) {
                        break; // ✅ Si funcionó, no probar más
                    }

                    $lastError = "Error en la API ({$url}): " . $response->body();
                    Log::warning($lastError);
                } catch (\Throwable $e) {
                    $lastError = "Excepción con {$conn['host']}: " . $e->getMessage();
                    Log::warning($lastError);
                }
            }

            if (!$response || $response->failed()) {
                throw new \Exception($lastError ?? 'No se pudo conectar con ninguno de los hosts de OLLAMA.');
            }

            $responseData = $response->json();
            if (empty($responseData['response'])) {
                throw new \Exception("Respuesta vacía de la API");
            }

            $generated_description = substr(strip_tags($responseData['response']), 0, 2000);
            Log::info("Descripción generada: " . $generated_description);

            $this->image->update(['generated_description' => $generated_description]);

            $job->update([
                'status'      => 'completed',
                'error'       => null,
                'finished_at' => now(),
            ]);

            RateLimiter::hit("user:{$this->image->record->user_id}:daily_image_process", 60 * 60 * 24);

            Log::info("Job completado correctamente para imagen ID {$this->image->id}");

        } catch (\Throwable $e) {
            Log::error("Error procesando descripción para imagen ID {$this->image->id}: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);

            $job->update([
                'status'      => 'failed',
                'error'       => $e->getMessage(),
                'finished_at' => now(),
            ]);
        }
    }
}
