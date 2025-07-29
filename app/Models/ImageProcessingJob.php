<?php

namespace App\Models;

use App\Models\Base\ImageProcessingJob as BaseImageProcessingJob;
use YMigVal\LaravelModelCache\HasCachedQueries;

class ImageProcessingJob extends BaseImageProcessingJob
{
	use HasCachedQueries;
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
