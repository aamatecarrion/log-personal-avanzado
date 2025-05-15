<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\Record;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImageController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'images.*' => 'required|image',
        ], [
            'images.*.required' => 'No se han seleccionado imágenes',
            'images.*.image' => 'El archivo seleccionado no es una imagen',
        ]);

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

            if (
                isset($exif['GPSLatitude'], $exif['GPSLatitudeRef'], $exif['GPSLongitude'], $exif['GPSLongitudeRef'])
            ) {
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

        return redirect()->route('images.upload')->with([
            'success' => 'Imágenes subidas correctamente.',
            'saved_images' => $savedImages,
        ]);
    }

    public function show(Image $image)
    {
        if ($image->user_id !== Auth::id()) {
            abort(403);
        }

        return response()->file(storage_path('app/private/' . $image->image_path));
    }

    private function convertGpsToDecimal($coord, $ref)
    {
        $degrees = count($coord) > 0 ? $this->gps2Num($coord[0]) : 0;
        $minutes = count($coord) > 1 ? $this->gps2Num($coord[1]) : 0;
        $seconds = count($coord) > 2 ? $this->gps2Num($coord[2]) : 0;

        $decimal = $degrees + ($minutes / 60) + ($seconds / 3600);

        if ($ref === 'S' || $ref === 'W') {
            $decimal = -$decimal;
        }

        return $decimal;
    }

    private function gps2Num($coordPart)
    {
        $parts = explode('/', $coordPart);
        if (count($parts) <= 0) return 0;
        if (count($parts) === 1) return floatval($parts[0]);
        return floatval($parts[0]) / floatval($parts[1]);
    }
}
