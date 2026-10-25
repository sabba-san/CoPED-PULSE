<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id',
        'organization_id',
        'title',
        'description',
        'status',
        'academic_year',
        'category_logo',
        'billing_type',
        'price',
        'cert_title',
        'cert_url',
        'bundle_title',
        'bundle_url',
        'whatsapp_group_url',
    ];

    protected $casts = [
        'status' => 'string',
        'price' => 'decimal:2',
    ];

    public function isCommercial(): bool
    {
        return $this->billing_type !== 'free' && (float) $this->price > 0;
    }

    public function hasBulkMaterial(): bool
    {
        return !empty($this->bundle_url);
    }

    public function hasCertification(): bool
    {
        return !empty($this->cert_title);
    }

    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    public function modules(): HasMany
    {
        return $this->hasMany(Module::class)->orderBy('order');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    public function learners(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'enrollments')
            ->withPivot('progress', 'enrolled_at', 'completed_at')
            ->withTimestamps();
    }

    public function moduleCompletions(): HasMany
    {
        return $this->hasMany(ModuleCompletion::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(CourseMessage::class);
    }

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Partner instructors see their org's courses; platform staff see all.
     * Local scope (not global) so platform queries stay explicit.
     */
    public function scopeOfOrganization(Builder $query, $organizationId): Builder
    {
        return $query->where('organization_id', $organizationId);
    }

    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->isPlatformStaff()) {
            return $query;
        }

        return $query->where('organization_id', $user->organization_id);
    }
}