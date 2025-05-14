<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImageController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'images.*' => 'required|image',
        ], [
            'images.*.required' => 'No se han seleccionado im genes',
            'images.*.image' => 'El archivo seleccionado no es una im gen'
        ]);

        if (!$validatedData) {
            return back()->withErrors([
                'images' => 'No se han seleccionado imágenes'
            ]);
        }

        $savedImages = [];

        foreach ($request->file('images') as $image) {
            $path = $image->store('images', 'private'); // guarda en storage/app/private/images

            $savedImages[] = Image::create([
                'user_id' => Auth::user()->id,
                'original_filename' => $image->getClientOriginalName(),
                'image_path' => $path,
            ]);
        }

        return redirect()->route('images.upload')->with([
            'success' => 'Images uploaded successfully.',
            'saved_images' => $savedImages,
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
