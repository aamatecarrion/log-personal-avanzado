<?php

namespace App\Models;

use App\Models\Base\Record as BaseRecord;
use Carbon\Carbon;
use YMigVal\LaravelModelCache\HasCachedQueries;

class Record extends BaseRecord
{
	use HasCachedQueries;
	 
	protected $fillable = [
		'user_id',
		'title',
		'description',
		'latitude',
		'longitude'
	];
	protected $appends = ['date_diff'];
    
    public function getDateDiffAttribute()
    {
        return Carbon::parse($this->created_at)->locale('es')->diffForHumans(['parts' => 3]);
    }
}
