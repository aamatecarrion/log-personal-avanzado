<?php

namespace App\Models;

use App\Models\Base\UserLimit as BaseUserLimit;

class UserLimit extends BaseUserLimit
{
	protected $fillable = [
		'user_id',
		'can_upload_images',
		'can_process_images',
		'daily_upload_limit',
		'daily_process_limit'
	];
}
