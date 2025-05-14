<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Image;
use App\Models\User;

class ImagePageController extends Controller
{
    public function index()
    {
        // Fetch images for the authenticated user
        $images = Image::where('user_id', Auth::id())->get();

        return inertia('images.index')->with([
            'images' => $images,
        ]);
    }
    
    public function upload()
    {
        return inertia('images.upload');
    }
    
    public function show(Image $image)
    {   
        // Ensure the user can only access their own images
        if ($image->user_id !== Auth::id()) {
            abort(403);
        }
        return inertia('images.show')->with([
            'image' => $image,
        ]);
    }
}
