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
 * Class Config
 * 
 * @property int $id
 * @property int $user_id
 * @property bool $ask_location_permission
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property User $user
 *
 * @package App\Models\Base
 */
class Config extends Model
{
	use HasFactory;
	protected $table = 'configs';

	protected $casts = [
		'user_id' => 'int',
		'ask_location_permission' => 'bool'
	];

	public function user()
	{
		return $this->belongsTo(User::class);
	}
}
