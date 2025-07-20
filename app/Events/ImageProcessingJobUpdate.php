<?php

namespace App\Events;

use App\Models\ImageProcessingJob;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ImageProcessingJobUpdate implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public ImageProcessingJob $job){}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
   public function broadcastOn(): array
    {
        return [
            new PrivateChannel('user.' . $this->job->image->record->user_id),
        ];
    }
    public function broadcastAs(): string
    {
        return 'image-processing-jobs.update';
    }
    public function broadcastWith(): array
    {
        return [
            'job' => $this->job,
        ];
    }
}
