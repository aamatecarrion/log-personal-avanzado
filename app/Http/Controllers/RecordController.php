<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Record;

class RecordController extends Controller {
    public function index() {
        if (!Auth::check()) return response()->json(['message' => 'Unauthorized'], 401);
        
        $records = Record::where('user_id', Auth::id())->orderBy('created_at', 'desc')->with('image')->get();
        return inertia('records.index', ['records' => $records]);
    }
    public function store(Request $request) {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:10000',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);
        Record::create($request->all());
        return redirect()->route('records.index')->with('success', 'Record created successfully');
    }
    public function create() {
        return inertia('records.create');
    }
    public function show(Record $record) {
        if ($record->user_id !== Auth::id()) return redirect()->route('home')->with('error', 'Forbidden');

        $record->load('image');
        return inertia('records.show', ['record' => $record]);
    }
    public function update(Request $request, Record $record) {
        if ($record->user_id !== Auth::id()) return redirect()->route('home')->with('error', 'Forbidden');

        $record->update($request->only(['title', 'description', 'latitude', 'longitude']));
        return redirect()->route('records.index')->with('success', 'Record updated successfully');
    }
    public function destroy(Record $record) {
        if ($record->user_id !== Auth::id()) return redirect()->route('home')->with('error', 'Forbidden');

        $record->delete();
        return redirect()->route('records.index')->with('success', 'Record deleted successfully');
    }
    public function edit(Record $record) {
        if ($record->user_id !== Auth::id()) return redirect()->route('home')->with('error', 'Forbidden');

        return inertia('records.edit', ['record' => $record]);
    }
}