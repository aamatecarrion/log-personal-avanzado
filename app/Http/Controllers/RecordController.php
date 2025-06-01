<?php

namespace App\Http\Controllers;

use App\Models\ImageProcessingJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Record;

class RecordController extends Controller {
    public function index() {
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
        Record::create($request->merge(['user_id' => Auth::id()])->all());
        return redirect()->route('records.index')->with('success', 'Record created successfully');
    }
    public function create() {
        return inertia('records.create');
    }
    public function show(Record $record) {
        $this->checkUser($record);

        $record->load('image.image_processing_jobs');
        $globalQueue = ImageProcessingJob::where('status', 'pending')
            ->orderBy('id')
            ->pluck('id');

        $total_in_queue = $globalQueue->count();

        foreach ($record->image->image_processing_jobs as $job) {
            if ($job->status === 'pending') {
                $job->position_in_queue = $globalQueue->search($job->id) + 1;
            } else {
                $job->position_in_queue = null;
            }
        }

        return inertia('records.show', ['record' => $record, 'total_in_queue' => $total_in_queue]);
    }
    public function update(Request $request, Record $record) {
        $this->checkUser($record);

        $record->update($request->only(['title', 'description', 'latitude', 'longitude']));
        return redirect()->route('records.index')->with('success', 'Record updated successfully');
    }
    public function destroy(Record $record) {
        $this->checkUser($record);

        $record->delete();
        return redirect()->route('records.index')->with('success', 'Record deleted successfully');
    }
    public function edit(Record $record) {
        $this->checkUser($record);

        return inertia('records.edit', ['record' => $record]);
    }
    private function checkUser($record) {
        if ($record->user_id !== Auth::id()) return redirect()->route('home')->with('error', 'Forbidden');
    }
}