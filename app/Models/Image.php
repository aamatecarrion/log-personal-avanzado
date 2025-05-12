<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    /** @use HasFactory<\Database\Factories\ImageFactory> */
    use HasFactory;
    protected $fillable = [
        'record_id',
        'generated_description',
        'file_latitude',
        'file_longitude',
        'file_date',
        'original_filename',
        'image_path',
    ];
}
