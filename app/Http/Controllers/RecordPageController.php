<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RecordPageController extends Controller
{
    public function index()
    {
        if (!Auth::check()) {
            return Inertia::render('auth/Login');
        }
        return Inertia::render('records');
    }
}
