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
        $record = Record::where('user_id', Auth::id())->where('id', $id)->first();

        if (!$record) {
            abort(404);
        }

        $formattedRecord = [
            'id' => $record->id,
            'title' => $record->title,
            'description' => $record->description,
            'latitude' => $record->latitude,
            'longitude' => $record->longitude,
            'created_at' => $record->created_at,
            'updated_at' => $record->updated_at,
            'date_diff' => Carbon::parse($record->created_at)->diffForHumans(),
        ];

        return Inertia::render('records.show', ['record' => $formattedRecord]);
    }
    public function create()
    {   
        return Inertia::render('records.create');
    }
}
