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

        // Retornar los registros correctamente formateados
        return inertia('records.index', [
            'records' => $formattedRecords,
        ]);
    }

    public function show(Record $record)
    {
        // Verificar si el registro pertenece al usuario autenticado
        if ($record->user_id !== Auth::id()) {
            return response()->json(['message' => 'Forbidden'], 403); // Maneja el caso de acceso no autorizado
        }
     
        $record->load('image');
                
        $formattedRecord = [
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

        return inertia('records.show', [
            'record' => $formattedRecord,
        ]);
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
    public function create()
    {   
        return Inertia::render('records.create');
    }
}