<?php

namespace App\Models;

use App\Models\Base\ImageProcessingJob as BaseImageProcessingJob;

class ImageProcessingJob extends BaseImageProcessingJob
{
	protected $fillable = [
		'image_id',
		'type',
		'status',
		'queued_at',
		'started_at',
		'finished_at',
		'error'
	];
}
