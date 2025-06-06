<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models\Base;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class UserLimit
 * 
 * @property int $id
 * @property int $user_id
 * @property bool $can_upload_images
 * @property bool $can_process_images
 * @property int|null $daily_upload_limit
 * @property int|null $daily_process_limit
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User $user
 *
 * @package App\Models\Base
 */
class UserLimit extends Model
{
	use HasFactory;
	protected $table = 'user_limits';

	protected $casts = [
		'user_id' => 'int',
		'can_upload_images' => 'bool',
		'can_process_images' => 'bool',
		'daily_upload_limit' => 'int',
		'daily_process_limit' => 'int'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
