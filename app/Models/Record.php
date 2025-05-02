<?php

namespace App\Models;

use App\Models\Base\Record as BaseRecord;

class Record extends BaseRecord
{
	protected $fillable = [
		'user_id',
		'title',
		'description',
		'latitude',
		'longitude'
	];
}
