<?php

namespace App\Http\Controllers;

use App\Models\Record;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MapController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        // Obtener todos los registros si es admin, o solo los suyos si no
        $records = Record::query()
            ->when(!$user->is_admin, fn($q) => $q->where('user_id', $user->id))
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->with('image')
            ->get();

        $record = null;

        // Obtener el registro específico si se pasa 'record_id'
        if ($request->has('record_id')) {
            $query = Record::where('id', $request->record_id)->with('image');
            
            if (!$user->is_admin) {
                $query->where('user_id', $user->id);
            }

            $record = $query->first();
        }

        return inertia('map.index', compact('records', 'record'));
    }
}
