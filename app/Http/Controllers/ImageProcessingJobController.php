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
        $ended = $jobs->filter(fn($job) => in_array($job->status, ['completed', 'failed', 'cancelled']))->sortByDesc('finished_at');


        // Combinar en el orden deseado
        $jobs = $processing->concat($pending)->concat($ended)->values();

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
    public function cancel(ImageProcessingJob $job)
    {
        $this->checkUser($job);

        ImageProcessingJob::where('id', $job->id)
            ->update(['status' => 'cancelled']);
        return redirect()->back()->with('success', 'Job cancelled successfully.');

    }
    public function processAllFailed()
    {
        $user = Auth::user();

        $failedJobs = ImageProcessingJob::whereIn('status', ['failed', 'cancelled'])
                        ->whereHas('image.record', fn($q) => $q->where('user_id',$user->id))->get();

        foreach ($failedJobs as $job) {
            if ($job->type === 'title') {
                GenerateImageTitle::dispatch($job->image);
            } elseif ($job->type === 'description') {
                GenerateImageDescription::dispatch($job->image);
            }
        }

        return redirect()->route('imageprocessing.index')->with('success', 'All failed jobs are being reprocessed.');
    }
    public function cancelAll()
    {
        $user = Auth::user();

        $cancelledJobs = ImageProcessingJob::whereIn('status', ['pending', 'processing'])
            ->whereHas('image.record', fn($q) => $q->where('user_id',$user->id))->update(['status' => 'cancelled']);
        if ($cancelledJobs === 0) {
            return redirect()->route('imageprocessing.index')->with('info', 'No pending or processing jobs to cancel.');
        } elseif (!$cancelledJobs) {
            return redirect()->route('imageprocessing.index')->with('error', 'Error cancelling jobs.');
        }
        return redirect()->route('imageprocessing.index')->with('success', 'All pending and processing jobs have been cancelled.');
    }

    private function checkUser(ImageProcessingJob $job) {
        if ($job->image->record->user_id !== Auth::id()) {
            abort(403, 'Forbidden');
        }
    }
}
