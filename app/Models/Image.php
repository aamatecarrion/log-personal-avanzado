<?php

namespace App\Models;

use App\Models\Base\Image as BaseImage;

class Image extends BaseImage
{
	protected $fillable = [
		'user_id',
		'record_id',
		'generated_description',
		'file_latitude',
		'file_longitude',
		'file_date',
		'original_filename',
		'image_path'
	];
}
