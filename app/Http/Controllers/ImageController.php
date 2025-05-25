<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\Record;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Jobs\ProcessImage;


class ImageController extends Controller {
    public function index() {

        $images = Image::where('user_id', Auth::id())
            ->where('record_id', '!=', null)
            ->orderBy('created_at', 'desc')
            ->with('record')
            ->get();
        return inertia('images.index', ['images' => $images]);
        return inertia('images.index');
    }

    public function store(Request $request) {
        $request->validate(['images.*' => 'required|image']);

        $savedImages = [];

        foreach ($request->file('images') as $file) {
            $path = $file->store('images', 'private');
            $absolutePath = $file->getPathname();

            $exif = @exif_read_data($absolutePath);

            $dateTaken = null;
            $latitude = null;
            $longitude = null;

            if ($exif && isset($exif['DateTimeOriginal'])) {
                $fechaCaptura = $exif['DateTimeOriginal'];
                $fecha = new DateTime($fechaCaptura, new DateTimeZone('Europe/Madrid'));
                $fecha->setTimezone(new DateTimeZone('UTC'));
                $dateTaken = $fecha->format('Y-m-d H:i:s');
            }

            if (isset($exif['GPSLatitude'], $exif['GPSLatitudeRef'], $exif['GPSLongitude'], $exif['GPSLongitudeRef'])) {
                $latitude = $this->convertGpsToDecimal($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
                $longitude = $this->convertGpsToDecimal($exif['GPSLongitude'], $exif['GPSLongitudeRef']);
            }

            $record = Record::create([
                'user_id' => Auth::id(),
                'title' => 'Imagen: ' . $file->getClientOriginalName(),
                'description' => null,
                'latitude' => $latitude,
                'longitude' => $longitude,
            ]);

            $savedImages[] = Image::create([
                'user_id' => Auth::id(),
                'record_id' => $record->id,
                'original_filename' => $file->getClientOriginalName(),
                'image_path' => $path,
                'file_date' => $dateTaken,
                'file_latitude' => $latitude,
                'file_longitude' => $longitude,
            ]);
        }

        foreach ($savedImages as $image) {
            ProcessImage::dispatch($image);
        }

        return redirect()->route('images.index')->with('success', 'Imágenes subidas y procesadas');
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
    private function checkUser($image) {
        if ($image->user_id !== Auth::id()) {
            return redirect()->route('home')->with('error', 'Forbidden');
        }
    }

    private function gps2Num($coordPart) {
        $parts = explode('/', $coordPart);
        if (count($parts) <= 0) return 0;
        if (count($parts) === 1) return floatval($parts[0]);
        return floatval($parts[0]) / floatval($parts[1]);
    }
}
