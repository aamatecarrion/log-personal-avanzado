<?php
namespace App\Http\Controllers;

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
            ->orderByDesc('created_at')
            ->get();

        $globalQueue = ImageProcessingJob::where('status', 'pending')
            ->orderBy('id')
            ->pluck('id');

        foreach ($jobs as $job) {
            if ($job->status === 'pending') {
                $job->position_in_queue = $globalQueue->search($job->id) + 1;
            } else {
                $job->position_in_queue = null;
            }
        }

        return inertia('image-processing-jobs.index', [
            'jobs' => $jobs,
        ]);
    }

}
