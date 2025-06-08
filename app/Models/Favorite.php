<?php

namespace App\Models;

use App\Models\Base\Favorite as BaseFavorite;

class Favorite extends BaseFavorite
{
	protected $fillable = [
		'user_id',
		'title'
	];
}
