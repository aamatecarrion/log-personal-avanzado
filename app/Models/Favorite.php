<?php

namespace App\Models;

use App\Models\Base\Favorite as BaseFavorite;
use YMigVal\LaravelModelCache\HasCachedQueries;

class Favorite extends BaseFavorite
{
	use HasCachedQueries;
	
	protected $fillable = [
		'user_id',
		'title'
	];
}
