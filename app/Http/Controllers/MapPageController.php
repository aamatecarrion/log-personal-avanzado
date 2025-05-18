<?php

namespace App\Http\Controllers;

use App\Models\Record;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth as FacadesAuth;
use Inertia\Inertia;

class MapPageController extends Controller
{
    public function index(Request $request) 
    {   
        $record_id = $request->input('record_id');
        $record = Record::where('id', $record_id)->where('user_id', Auth::id())->first();

        $records = Record::where('user_id', Auth::id())->with('image')->get();

        $formattedRecords = $records->map(function ($record) {
            return [
                'id' => $record->id,
                'title' => $record->title,
                'description' => $record->description,
                'latitude' => $record->latitude,
                'longitude' => $record->longitude,
                'created_at' => $record->created_at,
                'updated_at' => $record->updated_at,
                'date_diff' => Carbon::parse($record->created_at)->locale('es')->diffForHumans(['parts' => 8]),
                'image' => $record->image ? [
                    'id' => $record->image->id,
                    'created_at' => $record->image->created_at,
                    'updated_at' => $record->image->updated_at,
                    'original_filename' => $record->image->original_filename,
                    'image_path' => $record->image->image_path,
                    'file_date' => $record->image->file_date,
                    'file_date_diff' => Carbon::parse($record->image->file_date)->locale('es')->diffForHumans(['parts' => 8]),
                    'file_latitude' => $record->image->file_latitude,
                    'file_longitude' => $record->image->file_longitude,
                ] : null,
            ];
        });

        return Inertia::render('map')->with([
            'records' => $formattedRecords,
            'record' => $record,
        ]);
    }
}
