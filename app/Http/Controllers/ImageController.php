<?php

namespace App\Http\Controllers;

use App\Jobs\GenerateImageDescription;
use App\Jobs\GenerateImageTitle;
use App\Models\Image;
use App\Models\Record;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Jobs\ProcessImage;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image as InterventionImage;
use Intervention\Image\Encoders\JpegEncoder;

class ImageController extends Controller {
    public function index() {
        $user = Auth::user();

        $images = Image::whereHas('record', function ($query) use ($user) {
            if (!$user->is_admin) {
                $query->where('user_id', $user->id);
            }
        })
        ->whereNotNull('record_id')
        ->orderBy('created_at', 'desc')
        ->with('record')
        ->get();

        $uploadLimit = $this->getUploadLimit($user);

        return inertia('images.index', ['images' => $images, 'upload_limit' => $uploadLimit]);
    }


    private function getUploadLimit(User $user) {
        
        $key = "upload-images:$user->id";
        $limit = $user->user_limit?->daily_upload_limit;
        if ($limit === null) {
            return null;
        }
        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $seconds = RateLimiter::availableIn($key);
            $time = Carbon::now()->addSeconds($seconds);
        }

        $left = $limit - RateLimiter::attempts($key);

        $can_upload = $user->user_limit?->can_upload_images;

        return [
            'limit' => $limit,
            'left' => $left,
            'time' => $time ?? null,
            'can_upload' => $can_upload
        ];
    }

    public function create() {
        return inertia('images.create');
    }

    public function show($id) {
        $image = Image::with('record')->findOrFail($id);
        $this->checkUser($image);

        $filePath = storage_path('app/private/' . $image->image_path);

        if (!file_exists($filePath)) {
            return redirect()->route('home')->with('error', 'Archivo no encontrado');
        }

        return response()->file($filePath);
    }



    public function update(Request $request, Image $image) {
        $this->checkUser($image);

        $request->validate([
            'generated_description' => 'nullable|string|max:10000',
        ]);

        $image->update($request->only(['generated_description']));
        return redirect()->route('images.index')->with('success', 'Imagen actualizada');
    }
    public function destroy(Image $image) {
        $this->checkUser($image);

        $image->delete();
        return redirect()->route('images.index')->with('success', 'Imagen eliminada');
    }
    public function edit(Image $image) {
        $this->checkUser($image);

        return inertia('images.edit', ['image' => $image]);
    }
    private function convertGpsToDecimal($coord, $ref) {
        $degrees = count($coord) > 0 ? $this->gps2Num($coord[0]) : 0;
        $minutes = count($coord) > 1 ? $this->gps2Num($coord[1]) : 0;
        $seconds = count($coord) > 2 ? $this->gps2Num($coord[2]) : 0;

        $decimal = $degrees + ($minutes / 60) + ($seconds / 3600);

        if ($ref === 'S' || $ref === 'W') {
            $decimal = -$decimal;
        }

        return $decimal;
    }

    public function getUserTotalSize() {
        $userId = Auth::id();

        $imagenes = Image::whereHas('record', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->get();

        $totalBytes = 0;

        foreach ($imagenes as $imagen) {
            if (Storage::disk('private')->exists($imagen->image_path)) {
                $totalBytes += Storage::disk('private')->size($imagen->image_path);
            }
        }
        return round($totalBytes / 1024 / 1024, 2); // tamaño en megas
    }
    private function checkUser($image) {
        if (Auth::user()->is_admin) return;

        if ($image->record->user_id !== Auth::id()) {
            abort(403, 'Forbidden');
        }
    }

    private function gps2Num($coordPart) {
        $parts = explode('/', $coordPart);
        if (count($parts) <= 0) return 0;
        if (count($parts) === 1) return floatval($parts[0]);
        return floatval($parts[0]) / floatval($parts[1]);
    }
    public function store(Request $request)
    {
        $user = Auth::user();
        $this->checkUploadPermission($user);
        $imagenes = $request->file('images', []);
        $cantidad = count($imagenes);

        $this->validateUploadRequest($request);
        $this->checkUploadLimits($user, $cantidad);

        $savedImages = collect();
        $userImageSizes = $this->getUserImageSizes($user);

        foreach ($imagenes as $file) {
            $fileSize = $file->getSize();
            
            $potentialDuplicate = $this->hasPotentialDuplicate($fileSize, $userImageSizes);
            
            if ($potentialDuplicate) {
                if ($this->isExactDuplicate($file, $user) ) {
                    continue;
                }
            }
            
            $image = $this->saveImageAndRecord($file, $user);
            $savedImages->push($image);
            RateLimiter::hit("upload-images:$user->id", 86400);
        }

        $this->dispatchJobsForImages($savedImages);

        return redirect()->route('images.index')->with('success', 'Imágenes subidas y procesadas');
    }

    private function getUserImageSizes(User $user): array
    {
        return Image::whereHas('record', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->get()
            ->mapWithKeys(function ($image) {
                try {
                    $size = Storage::disk('private')->size($image->image_path);
                    return [$image->id => $size];
                } catch (\Exception $e) {
                    return [$image->id => 0]; // Si no existe
                }
            })
            ->filter()
            ->toArray();
    }

    private function hasPotentialDuplicate(int $fileSize, array $userImageSizes): bool
    {
        return in_array($fileSize, $userImageSizes, true);
    }

    private function isExactDuplicate($file, User $user): bool
    {
        $newFileHash = md5_file($file->path());
        
        return Image::whereHas('record', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->get()
            ->contains(function ($image) use ($newFileHash) {
                try {
                    $existingContent = Storage::disk('private')->get($image->image_path);
                    return md5($existingContent) === $newFileHash;
                } catch (\Exception $e) {
                    return false;
                }
            });
    }
    private function checkUploadPermission(User $user) {

        $hasLimitAndCantUpload = $user->user_limit?->can_upload_images === 0;

        if ($hasLimitAndCantUpload) {
            abort(403, 'Forbidden: No tienes permiso para subir imágenes.');
        }
    }

    private function validateUploadRequest(Request $request): void
    {
        $request->validate([
            'images.*' => 'required|image',
        ]);
    }

    private function checkUploadLimits(User $user, int $cantidad): void
    {
        $key = "upload-images:$user->id";
        $limit = $user->user_limit?->daily_upload_limit;
        if ($limit === null) {
            return;
        }
        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $seconds = RateLimiter::availableIn($key);
            $tiempo = Carbon::now()->addSeconds($seconds);
            abort(429, "Has alcanzado el límite de $limit imágenes. Inténtalo en " . $tiempo->diffForHumans());
        }

        $restantes = $limit - RateLimiter::attempts($key);
        if ($cantidad > $restantes) {
            abort(429, "De momento puedes subir hasta $restantes imágenes más.");
        }
    }

    private function saveImageAndRecord($file, User $user): Image
    {
        $path = $file->store('images', 'private');
        $fullPath = Storage::disk('private')->path($path);
        
        if (file_exists($fullPath)) {
            @chmod($fullPath, 0644);
        }
        
        // Generar miniatura con estructura de directorios
        $thumbnailPath = 'thumbnails/' . basename($path);
        $thumbnailFullPath = Storage::disk('private')->path($thumbnailPath);
        
        // Crear directorio de miniaturas si no existe
        Storage::disk('private')->makeDirectory('thumbnails');
        
        try {
            InterventionImage::read($fullPath)
                ->scaleDown(300, 300)
                ->encode(new JpegEncoder(quality: 80))
                ->save($thumbnailFullPath);
                
            if (file_exists($thumbnailFullPath)) {
                @chmod($thumbnailFullPath, 0644);
            }
        } catch (\Exception $e) {
            logger()->error('Error generando miniatura: ' . $e->getMessage());
        }

        $absolutePath = $file->getPathname();
        $exif = @exif_read_data($absolutePath);

        $dateTaken = null;
        $latitude = null;
        $longitude = null;

        if ($exif && isset($exif['DateTimeOriginal'])) {
            $fecha = new \DateTime($exif['DateTimeOriginal'], new \DateTimeZone('Europe/Madrid'));
            $fecha->setTimezone(new \DateTimeZone('UTC'));
            $dateTaken = $fecha->format('Y-m-d H:i:s');
        }

        if (isset($exif['GPSLatitude'], $exif['GPSLatitudeRef'], $exif['GPSLongitude'], $exif['GPSLongitudeRef'])) {
            $latitude = $this->convertGpsToDecimal($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
            $longitude = $this->convertGpsToDecimal($exif['GPSLongitude'], $exif['GPSLongitudeRef']);
        }

        $record = Record::create([
            'user_id' => $user->id,
            'title' => 'Imagen: ' . $file->getClientOriginalName(),
            'description' => null,
            'latitude' => $latitude,
            'longitude' => $longitude,
        ]);

        return Image::create([
            'record_id' => $record->id,
            'original_filename' => $file->getClientOriginalName(),
            'image_path' => $path,
            'file_date' => $dateTaken,
            'file_latitude' => $latitude,
            'file_longitude' => $longitude,
        ]);
    }

    private function dispatchJobsForImages($images): void
    {
        $user = Auth::user();

        if ($user->user_limit && !$user->user_limit->can_process_images) {
            return;
        }

        $daylyLimit = $user->user_limit?->daily_process_limit;

        if ($daylyLimit === null) {
            foreach ($images as $image) {
                GenerateImageTitle::dispatch($image);
                GenerateImageDescription::dispatch($image);
            }
            return;
        }
        $key = "user:{$user->id}:daily_image_process";

        $attempts = RateLimiter::attempts($key);
        $available = $daylyLimit - $attempts;

        if ($available <= 0) return;

        foreach ($images as $image) {
            if ($available <= 0) break;
            
            GenerateImageTitle::dispatch($image);
            $available--;
            
            if ($available <= 0) break;

            GenerateImageDescription::dispatch($image);
            $available--;
        }
    }

    public function showThumbnail($id)
    {
        $image = Image::with('record')->findOrFail($id);
        $this->checkUser($image);
        
        $thumbnailPath = 'thumbnails/' . basename($image->image_path);
        
        $thumbnailFullPath = storage_path('app/private/' . $thumbnailPath);
        
        if (!file_exists($thumbnailFullPath)) {
            abort(404, 'Miniatura no encontrada');    
        }

        return response()->file($thumbnailFullPath);
    }

}
