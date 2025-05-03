<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models\Base;

use App\Models\Image;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Record
 * 
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string|null $description
 * @property float|null $latitude
 * @property float|null $longitude
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User $user
 * @property Image|null $image
 *
 * @package App\Models\Base
 */
class Record extends Model
{
	use HasFactory;
	protected $table = 'records';

	protected $casts = [
		'user_id' => 'int',
		'latitude' => 'float',
		'longitude' => 'float'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}

	public function image()
	{
		return $this->hasOne(Image::class);
	}
}
