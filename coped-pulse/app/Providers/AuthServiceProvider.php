<?php

namespace App\Providers;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Module;
use App\Policies\AssessmentPolicy;
use App\Policies\CoursePolicy;
use App\Policies\ModulePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Course::class => CoursePolicy::class,
        Module::class => ModulePolicy::class,
        Assessment::class => AssessmentPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
