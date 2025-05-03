<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models\Base;

use App\Models\Record;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Image
 * 
 * @property int $id
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
 *
 * @package App\Models\Base
 */
class Image extends Model
{
	protected $table = 'images';

	protected $casts = [
		'record_id' => 'int',
		'file_latitude' => 'float',
		'file_longitude' => 'float',
		'file_date' => 'datetime'
	];

	public function record()
	{
		return $this->belongsTo(Record::class);
	}
}
