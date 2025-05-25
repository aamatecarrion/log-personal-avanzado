<?php

namespace App\Http\Controllers;

use App\Models\Image;
use App\Models\Record;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Jobs\ProcessImage;


class ImageController extends Controller
{
    public function index()
    {
        return inertia('images.index');
    }
    
    public function upload()
    {
        return inertia('images.upload');
    }
    
    
}
