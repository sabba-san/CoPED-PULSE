<?php

require __DIR__ . '/../../vendor/autoload.php';
$app = require_once __DIR__ . '/../../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Enrollment;
use App\Models\ModuleCompletion;
use Illuminate\Support\Facades\Schema;

echo "--- Recalculating Enrollment Progress ---\n";

$enrollments = Enrollment::with('course', 'user')->get();

foreach ($enrollments as $enrollment) {
    $course = $enrollment->course;
    $user = $enrollment->user;

    if (!$course || !$user) {
        echo "Skipping invalid enrollment #{$enrollment->id}\n";
        continue;
    }

    $totalModules = $course->modules()->count();

    if (Schema::hasTable('module_user')) {
        $doneModules = $user->completedModules()
            ->whereIn('modules.id', $course->modules()->pluck('id'))
            ->count();
    } else {
        $doneModules = ModuleCompletion::where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->count();
    }

    $hasAssessments = $course->assessments()->whereNull('module_id')->count() > 0;

    $oldProgress = $enrollment->progress;

    if ($enrollment->completed_at !== null) {
        $enrollment->progress = 100.00;
    } else {
        if ($hasAssessments) {
            // Up to 80% from modules; 20% reserved for final assessment
            $progress = $totalModules > 0 ? round(($doneModules / $totalModules) * 80, 2) : 0;
        } else {
            $progress = $totalModules > 0 ? round(($doneModules / $totalModules) * 100, 2) : 0;
            if ($doneModules >= $totalModules && $totalModules > 0) {
                $enrollment->completed_at = now();
            }
        }
        $enrollment->progress = $progress;
    }

    $enrollment->save();

    echo sprintf(
        "Enrollment #%d | User: %s | Course: %s | Modules: %d/%d | Old: %s%% -> New: %s%%\n",
        $enrollment->id,
        $user->name,
        $course->title,
        $doneModules,
        $totalModules,
        $oldProgress,
        $enrollment->progress
    );
}

echo "--- Progress Recalculation Complete ---\n";
