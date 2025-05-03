<?php

namespace App\Http\Controllers;

use App\Models\Base\Record;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RecordPageController extends Controller
{
    public function index()
    {
        return Inertia::render('records.index');
    }
    public function show($id)
    {   
        return Inertia::render('records.show', compact('id'));
    }
    public function create()
    {   
        return Inertia::render('records.create');
    }
}
