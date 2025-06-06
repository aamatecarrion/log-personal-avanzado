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

class ImageController extends Controller {
    public function index() {

        $images = Image::whereHas('record', function($query) {
            $query->where('user_id', Auth::id());
        
        })->whereNotNull('record_id')
            ->orderBy('created_at', 'desc')
            ->with('record')
            ->get();

        return inertia('images.index', ['images' => $images]);
    }

    public function create() {
        return inertia('images.create');
    }

    public function show($id) {
        $image = Image::findOrFail($id);
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
        $userId = Auth::id();
        $imagenes = $request->file('images', []);
        $cantidad = count($imagenes);

        $this->validateUploadRequest($request);
        $this->checkUploadLimits($userId, $cantidad);

        $savedImages = collect();

        foreach ($imagenes as $file) {
            $savedImages->push($this->saveImageAndRecord($file, $userId));
            RateLimiter::hit("upload-images:$userId", 86400);
        }

        $this->dispatchJobsForImages($savedImages);

        return redirect()->route('images.index')->with('success', 'Imágenes subidas y procesadas');
    }
    private function validateUploadRequest(Request $request): void
    {
        $request->validate([
            'images.*' => 'required|image',
        ]);
    }

    private function checkUploadLimits(int $userId, int $cantidad): void
    {
        $key = "upload-images:$userId";
        $limit = User::find($userId)->upload_limit ?? null;
        if ($limit === null) {
            return; // No hay límite definido, no hacemos nada
        }
        if (RateLimiter::tooManyAttempts($key, $limit)) {
            $restantes = RateLimiter::availableIn($key);
            $segundos = RateLimiter::availableIn($key);
            $tiempo = Carbon::seconds($segundos);
            abort(429, "Has alcanzado el límite de $limit imágenes. Inténtalo en " . $tiempo->cascade()->forHumans());
        }

        $restantes = $limit - RateLimiter::attempts($key);
        if ($cantidad > $restantes) {
            abort(429, "De momento puedes subir hasta $restantes imágenes más.");
        }
    }

    private function saveImageAndRecord($file, int $userId): Image
    {
        $path = $file->store('images', 'private');
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
            'user_id' => $userId,
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
        foreach ($images as $image) {
            GenerateImageDescription::dispatch($image);
            GenerateImageTitle::dispatch($image);
        }
    }
}
