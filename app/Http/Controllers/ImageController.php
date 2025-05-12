<?php

namespace App\Http\Controllers;

use App\Models\Image;
use Illuminate\Http\Request;

class ImageController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'images.*' => 'required|image',
        ]);

        $savedImages = [];

        foreach ($request->file('images') as $image) {
            $path = $image->store('images', 'private'); // guarda en storage/app/private/images

            $savedImages[] = Image::create([
                'original_filename' => $image->getClientOriginalName(),
                'image_path' => $path,
            ]);
        }

        return redirect()->route('images.upload')->with([
            'success' => 'Images uploaded successfully.',
            'saved_images' => $savedImages,
        ]);
    }
}
