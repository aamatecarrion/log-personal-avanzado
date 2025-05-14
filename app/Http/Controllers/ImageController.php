<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\Record;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use PhpExif\Reader\Reader;


class ImageController extends Controller
{
    private function gps2Num($coordPart)
    {
        $parts = explode('/', $coordPart);
        if (count($parts) <= 0) return 0;
        if (count($parts) === 1) return floatval($parts[0]);
        return floatval($parts[0]) / floatval($parts[1]);
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


    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image',
        ]);

        $file = $request->file('image');
        $path = $file->store('images', 'public');
        $absolutePath = $file->getPathname();

        $exif = @exif_read_data($absolutePath);

        $dateTaken = null;
        $latitude = null;
        $longitude = null;

        if ($exif && isset($exif['DateTimeOriginal'])) {
            $dateTaken = date('Y-m-d', strtotime($exif['DateTimeOriginal']));
        }

        if (isset($exif['GPSLatitude'], $exif['GPSLatitudeRef'], $exif['GPSLongitude'], $exif['GPSLongitudeRef'])) {
            $latitude = $this->convertGpsToDecimal($exif['GPSLatitude'], $exif['GPSLatitudeRef']);
            $longitude = $this->convertGpsToDecimal($exif['GPSLongitude'], $exif['GPSLongitudeRef']);
        }

        // Crear el record asociado
        $record = Record::create([
            'user_id' => Auth::id(),
            'title' => 'Registro de imagen: ' . $file->getClientOriginalName(),
            'description' => null,
            'latitude' => $latitude,
            'longitude' => $longitude,
        ]);

        // Guardar imagen y enlazar al record
        $image = Image::create([
            'user_id' => Auth::id(),
            'record_id' => $record->id,
            'original_filename' => $file->getClientOriginalName(),
            'image_path' => $path,
            'file_date' => $dateTaken,
            'file_latitude' => $latitude,
            'file_longitude' => $longitude,
        ]);

        return response()->json([
            'image' => $image,
            'record' => $record,
        ]);
    }
    public function show(Image $image)
    {
        // Asegúrate de que el usuario solo accede a sus propias imágenes
        if ($image->user_id !== Auth::id()) {
            abort(403);
        }

        // Devuelve el archivo como imagen
        return response()->file(storage_path('app/private/' . $image->image_path));
    }
}
