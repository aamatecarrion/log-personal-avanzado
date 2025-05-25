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
        $records = Record::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')->with('image')
            ->get();

        return inertia('records.index')->with('records', $records);
    }

    public function show(Record $record)
    {
        return inertia('records.show')->with('record', $record);
    }
    
    public function create()
    {   
        return inertia('records.create');
    }
}