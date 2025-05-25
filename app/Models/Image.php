<?php

namespace App\Models;

use App\Models\Base\Image as BaseImage;
use Carbon\Carbon;

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

	protected $appends = ['file_date_diff']; // Añade el campo al array/JSON

    // Accesor para date_diff
    public function getFileDateDiffAttribute()
    {
        return Carbon::parse($this->file_date)->locale('es')->diffForHumans(['parts' => 8]);
    }
}
