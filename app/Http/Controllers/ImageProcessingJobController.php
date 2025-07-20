<?php
namespace App\Http\Controllers;

use App\Jobs\GenerateImageDescription;
use App\Jobs\GenerateImageTitle;
use App\Models\Image;
use App\Models\ImageProcessingJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImageProcessingJobController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $jobs = ImageProcessingJob::with(['image.record'])
        ->whereHas('image.record', fn($q) => $q->where('user_id', $user->id))
        ->get();
        
        if ($user->is_admin) {
            $jobs = ImageProcessingJob::with(['image.record'])->get();
        }
        
        // Separar por estado
        $processing = $jobs->filter(fn($job) => $job->status === 'processing')->sortBy('queued_at');
        $pending = $jobs->filter(fn($job) => $job->status === 'pending')->sortBy('queued_at');
        $completed = $jobs->filter(fn($job) => in_array($job->status, ['completed', 'failed']))->sortByDesc('finished_at');


        // Combinar en el orden deseado
        $jobs = $processing->concat($pending)->concat($completed)->values();

        // Calcular posición en la cola
        $globalQueue = ImageProcessingJob::where('status', 'pending')
            ->orderBy('queued_at')
            ->get();

        $total_in_queue = $globalQueue->count();

        foreach ($jobs as $job) {
            if ($job->status === 'pending') {
                $job->position_in_queue = $globalQueue->search(fn($item) => $item->id === $job->id) + 1;
            } else {
                $job->position_in_queue = null;
            }
        }

        return inertia('image-processing-jobs.index', [
            'jobs' => $jobs,
            'total_in_queue' => $total_in_queue,
        ]);
    }


    public function show(ImageProcessingJob $job)
    {
        // Cola global ordenada (solo IDs necesarios para buscar posición)
        $globalQueue = ImageProcessingJob::where('status', 'pending')
            ->orderBy('queued_at')
            ->get();

        $total_in_queue = $globalQueue->count();

        if ($job->status === 'pending') {
            $job->position_in_queue = $globalQueue->search(fn($item) => $item->id === $job->id) + 1;
        } else {
            $job->position_in_queue = null;
        }

        return inertia('image-processing-jobs.show', [
            'job' => $job,
            'total_in_queue' => $total_in_queue,
        ]);
    }


    public function generateDescription(Request $request, $id)
    {   
        $image = Image::findOrFail($id);

        if ($image->record->user_id !== Auth::id()) {
            return redirect()->back()->with('error', 'No tienes permiso para procesar esta imagen.');
        }

        GenerateImageDescription::dispatch($image);
    }
    public function generateTitle(Request $request, $id)
    {   
        $image = Image::findOrFail($id);

        if ($image->record->user_id !== Auth::id()) {
            return redirect()->back()->with('error', 'No tienes permiso para procesar esta imagen.');
        }

        GenerateImageTitle::dispatch($image);
    }
    public function cancel(Request $request, ImageProcessingJob $job)
    {
        $this->checkUser($job);

        $updated = ImageProcessingJob::where('id', $job->id)
            ->where('status', 'pending')
            ->update(['status' => 'cancelled']);

        if ($updated) {
            return response()->json(['message' => 'Job cancelled.'], 200);
        }

        $job->refresh();

        if ($job->status === 'processing') {
            return response()->json(['message' => 'Job already processing, cannot cancel.'], 409);
        }

        return response()->json(['message' => 'Job is already finished.'], 410);
    }




    private function checkUser(ImageProcessingJob $job) {
        if ($job->image->record->user_id !== Auth::id()) {
            abort(403, 'Forbidden');
        }
    }
}
