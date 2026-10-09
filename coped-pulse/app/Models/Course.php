<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'instructor_id',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public function instructor()
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function modules()
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function enrollments()
    {
        return $this->hasMany(Enrollment::class);
    }

    public function assessments()
    {
        return $this->hasMany(Assessment::class);
    }

    public function learners()
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot('progress', 'enrolled_at', 'completed_at')
            ->withTimestamps();
    }
}