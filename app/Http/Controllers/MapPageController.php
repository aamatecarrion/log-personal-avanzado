<?php

namespace App\Http\Controllers;

use App\Models\Record;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth as FacadesAuth;
use Inertia\Inertia;

class MapPageController extends Controller
{
    public function index()
    {
        
        return Inertia::render('map')->with('records', Auth::user()->records()->get());
    }
}
