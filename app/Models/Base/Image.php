<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models\Base;

use App\Models\Record;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Image
 * 
 * @property int $id
 * @property int $user_id
 * @property int|null $record_id
 * @property string|null $generated_description
 * @property float|null $file_latitude
 * @property float|null $file_longitude
 * @property Carbon|null $file_date
 * @property string $original_filename
 * @property string $image_path
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Record|null $record
 * @property User $user
 *
 * @package App\Models\Base
 */
class Image extends Model
{
	use HasFactory;
	protected $table = 'images';

	protected $casts = [
		'user_id' => 'int',
		'record_id' => 'int',
		'file_latitude' => 'float',
		'file_longitude' => 'float',
		'file_date' => 'datetime'
	];

	public function record()
	{
		return $this->belongsTo(Record::class);
	}

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
