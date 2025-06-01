<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models\Base;

use App\Models\Image;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ImageProcessingJob
 * 
 * @property int $id
 * @property int $image_id
 * @property string $type
 * @property string $status
 * @property Carbon|null $queued_at
 * @property Carbon|null $started_at
 * @property Carbon|null $finished_at
 * @property string|null $error
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Image $image
 *
 * @package App\Models\Base
 */
class ImageProcessingJob extends Model
{
	use HasFactory;
	protected $table = 'image_processing_jobs';

	protected $casts = [
		'image_id' => 'int',
		'queued_at' => 'datetime',
		'started_at' => 'datetime',
		'finished_at' => 'datetime'
	];

	public function image()
	{
		return $this->belongsTo(Image::class);
	}
}
