<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ImagePageController extends Controller
{
    public function upload()
    {
        return inertia('images.upload');
    }
}
