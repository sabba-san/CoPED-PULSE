<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'content_type',
        'content_url',
        'content',
        'order',
        'duration',
    ];

    protected $casts = [
        'order' => 'integer',
        'duration' => 'integer',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}