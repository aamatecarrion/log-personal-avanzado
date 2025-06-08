<?php

namespace App\Http\Controllers;

use App\Models\Record;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MapController extends Controller
{
    public function index(Request $request)
    {   
        $records = Record::where('user_id', Auth::id())
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')->with('image')
            ->get();

        if ($request->has('record_id')) {
            $record = Record::where('user_id', Auth::id())
                ->where('id', $request->record_id)
                ->with('image')->first();

            return inertia('map.index', [
                'records' => $records,
                'record' => $record
            ]);
        }

        return inertia('map.index', [
            'records' => $records,
        ]);
    }
}
