<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\LessonCompletion;
use App\Models\Module;
use App\Models\ModuleCompletion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Schema;

class ModuleCompletionController extends Controller
{
    /**
     * Mark a module as complete, auto-calculate course progress percentage,
     * and notify learner via flash toast while touching enrollment updated_at for instructor feed.
     */
    public function store(Course $course, Module $module): RedirectResponse
    {
        abort_if($course->status !== 'published', 404);
        abort_if($module->course_id !== $course->id, 404);

        $enrollment = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        $user = auth()->user();

        // 1. Sync into module_user pivot table
        if (Schema::hasTable('module_user')) {
            $user->completedModules()->syncWithoutDetaching([$module->id]);
        }

        // 2. Sync into module_completions table for backward compatibility
        if (Schema::hasTable('module_completions')) {
            ModuleCompletion::firstOrCreate(
                ['user_id' => $user->id, 'module_id' => $module->id],
                ['course_id' => $course->id]
            );
        }

        // 3. Cascade down to child lessons
        if (Schema::hasTable('lesson_completions')) {
            foreach ($module->lessons()->pluck('id') as $lessonId) {
                LessonCompletion::firstOrCreate(
                    ['user_id' => $user->id, 'lesson_id' => $lessonId],
                    ['course_id' => $course->id, 'module_id' => $module->id]
                );
            }
        }

        // 4. Auto-calculate weighted progress:
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

        if ($enrollment->completed_at === null) {
            if ($hasAssessments) {
                // Modules account for up to 80% progress; remaining 20% reserved for Final Assessment
                $progress = $totalModules > 0 ? round(($doneModules / $totalModules) * 80, 2) : 0;
            } else {
                // 100% awarded when all modules are done
                $progress = $totalModules > 0 ? round(($doneModules / $totalModules) * 100, 2) : 0;
                if ($doneModules >= $totalModules && $totalModules > 0) {
                    $enrollment->completed_at = now();
                }
            }
            $enrollment->progress = $progress;
        }

        $enrollment->touch(); // Floats learner to top of Instructor Recent Activity
        $enrollment->save();

        return back()->with('success', "Module completed: {$module->title} ({$doneModules}/{$totalModules} modules done · {$enrollment->progress}% course progress).");
    }

    /**
     * Unmark a module as complete and recalculate progress.
     */
    public function destroy(Course $course, Module $module): RedirectResponse
    {
        abort_if($module->course_id !== $course->id, 404);

        $enrollment = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        $user = auth()->user();

        if (Schema::hasTable('module_user')) {
            $user->completedModules()->detach($module->id);
        }

        if (Schema::hasTable('module_completions')) {
            ModuleCompletion::where('user_id', $user->id)
                ->where('module_id', $module->id)
                ->delete();
        }

        if (Schema::hasTable('lesson_completions')) {
            LessonCompletion::where('user_id', $user->id)
                ->where('module_id', $module->id)
                ->delete();
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

        if ($hasAssessments) {
            $progress = $totalModules > 0 ? round(($doneModules / $totalModules) * 80, 2) : 0;
            if ($enrollment->completed_at === null) {
                $enrollment->progress = $progress;
            }
        } else {
            $progress = $totalModules > 0 ? round(($doneModules / $totalModules) * 100, 2) : 0;
            if ($doneModules < $totalModules) {
                $enrollment->completed_at = null;
            }
            $enrollment->progress = $progress;
        }

        $enrollment->touch();
        $enrollment->save();

        return back()->with('success', 'Module marked incomplete.');
    }
}
