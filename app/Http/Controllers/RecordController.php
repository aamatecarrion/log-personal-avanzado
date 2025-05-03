<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Record;
use App\Models\User;
use Inertia\Inertia;

class RecordController extends Controller
{
    public function index()
    {   
        if (!Auth::check()) {
            return Inertia::render('auth/Login');
        }
    
        $records = Auth::user()->records()->paginate(10);
    
        return Inertia::render('records', [
            'records' => $records,
        ]);
    }
}
