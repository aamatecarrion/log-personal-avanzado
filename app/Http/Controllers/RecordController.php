<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Record;
use App\Models\User;
use Carbon\Carbon;
use Carbon\Language;
use Inertia\Inertia;

class RecordController extends Controller
{
    public function index()
    {
        return inertia('records.index');
    }
    public function show()
    {   
        return inertia('records.show');
    }
    
    public function create()
    {   
        return inertia('records.create');
    }
}