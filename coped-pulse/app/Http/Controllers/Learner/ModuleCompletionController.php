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

        // 4. Auto-calculate progress: completed modules / total modules in course
        $totalModules = $course->modules()->count();
        if (Schema::hasTable('module_user')) {
            $completedCount = $user->completedModules()
                ->whereIn('modules.id', $course->modules()->pluck('id'))
                ->count();
        } else {
            $completedCount = ModuleCompletion::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->count();
        }

        $progress = $totalModules > 0 ? round(($completedCount / $totalModules) * 100, 2) : 0;

        // Updating progress automatically touches updated_at, floating learner to top of instructor feed
        $enrollment->update([
            'progress' => $progress,
        ]);

        return back()->with('success', 'Module completed! Progress updated.');
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
            $completedCount = $user->completedModules()
                ->whereIn('modules.id', $course->modules()->pluck('id'))
                ->count();
        } else {
            $completedCount = ModuleCompletion::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->count();
        }

        $progress = $totalModules > 0 ? round(($completedCount / $totalModules) * 100, 2) : 0;

        $enrollment->update([
            'progress' => $progress,
        ]);

        return back()->with('success', 'Module marked incomplete.');
    }
}
