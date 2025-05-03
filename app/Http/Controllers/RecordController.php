<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Record;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;

class RecordController extends Controller
{
    public function index()
    {   
        if (!Auth::check()) {
            return response()->json(['message' => 'Unauthorized'], 401); // Maneja el caso de no autenticación
        }

        // Obtener los registros del usuario autenticado
        $records = Record::where('user_id', Auth::id())->orderBy('created_at', 'desc')->get();

        // Si no hay registros, puedes devolver un array vacío
        if ($records->isEmpty()) {
            return response()->json([]);
        }

        // Transformar los registros a un formato específico antes de devolverlos
        $formattedRecords = $records->map(function ($record) {
            return [
                'id' => $record->id,
                'title' => $record->title,
                'description' => $record->description,
                'latitude' => $record->latitude,
                'longitude' => $record->longitude,
                'created_at' => $record->created_at,
                'updated_at' => $record->updated_at,
                'date_diff' => Carbon::parse($record->created_at)->diffForHumans(),
            ];
        });

        // Retornar los registros correctamente formateados
        return response()->json($formattedRecords);
    }

    public function show($id)
    {
        $record = Record::where('user_id', Auth::id())->where('id', $id)->firstOrFail();

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

        return response()->json($formattedRecord);
    }
    public function store(Request $request)
    {
        Record::create([
            'title' => $request->title,
            'description' => $request->description,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'user_id' => Auth::id(),
        ]);
    }
}