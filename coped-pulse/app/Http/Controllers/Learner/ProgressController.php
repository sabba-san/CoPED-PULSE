<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonCompletion;
use App\Models\Module;
use App\Models\ModuleCompletion;
use Illuminate\Support\Facades\Schema;

class ProgressController extends Controller
{
    public function complete(Course $course, Module $module)
    {
        abort_if($course->status !== 'published', 404);
        abort_if($module->course_id !== $course->id, 404);

        $enrollment = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if (! Schema::hasTable('module_completions')) {
            return back()->with('error', 'Progress tracking is unavailable right now. Please ask an administrator to run migrations.');
        }

        ModuleCompletion::firstOrCreate(
            ['user_id' => auth()->id(), 'module_id' => $module->id],
            ['course_id' => $course->id]
        );

        // Cascade down: completing a module completes its lessons,
        // keeping the parent-check invariant (all children done).
        if (Schema::hasTable('lesson_completions')) {
            foreach ($module->lessons()->pluck('id') as $lessonId) {
                LessonCompletion::firstOrCreate(
                    ['user_id' => auth()->id(), 'lesson_id' => $lessonId],
                    ['course_id' => $course->id, 'module_id' => $module->id]
                );
            }
        }

        $this->sync($enrollment, $course);

        return back()->with('success', 'Module marked as complete.');
    }

    public function uncomplete(Course $course, Module $module)
    {
        abort_if($module->course_id !== $course->id, 404);

        $enrollment = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if (! Schema::hasTable('module_completions')) {
            return back()->with('error', 'Progress tracking is unavailable right now. Please ask an administrator to run migrations.');
        }

        ModuleCompletion::where('user_id', auth()->id())
            ->where('module_id', $module->id)
            ->delete();

        if (Schema::hasTable('lesson_completions')) {
            LessonCompletion::where('user_id', auth()->id())
                ->where('module_id', $module->id)
                ->delete();
        }

        $this->sync($enrollment, $course);

        return back();
    }

    public function lessonComplete(Course $course, Module $module, Lesson $lesson)
    {
        abort_if($course->status !== 'published', 404);
        abort_if($module->course_id !== $course->id, 404);
        abort_if($lesson->module_id !== $module->id, 404);

        $enrollment = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if (! Schema::hasTable('lesson_completions')) {
            return back()->with('error', 'Progress tracking is unavailable right now. Please ask an administrator to run migrations.');
        }

        LessonCompletion::firstOrCreate(
            ['user_id' => auth()->id(), 'lesson_id' => $lesson->id],
            ['course_id' => $course->id, 'module_id' => $module->id]
        );

        // Cascade up: all lessons done → parent module complete.
        if (Schema::hasTable('module_completions')) {
            $total = $module->lessons()->count();
            $done = LessonCompletion::where('user_id', auth()->id())
                ->where('module_id', $module->id)
                ->count();

            if ($total > 0 && $done >= $total) {
                ModuleCompletion::firstOrCreate(
                    ['user_id' => auth()->id(), 'module_id' => $module->id],
                    ['course_id' => $course->id]
                );
            }
        }

        $this->sync($enrollment, $course);

        return back();
    }

    public function lessonUncomplete(Course $course, Module $module, Lesson $lesson)
    {
        abort_if($module->course_id !== $course->id, 404);
        abort_if($lesson->module_id !== $module->id, 404);

        $enrollment = Enrollment::where('user_id', auth()->id())
            ->where('course_id', $course->id)
            ->firstOrFail();

        if (! Schema::hasTable('lesson_completions')) {
            return back()->with('error', 'Progress tracking is unavailable right now. Please ask an administrator to run migrations.');
        }

        LessonCompletion::where('user_id', auth()->id())
            ->where('lesson_id', $lesson->id)
            ->delete();

        // Cascade up: a child undone → parent no longer all-complete.
        if (Schema::hasTable('module_completions')) {
            ModuleCompletion::where('user_id', auth()->id())
                ->where('module_id', $module->id)
                ->delete();
        }

        $this->sync($enrollment, $course);

        return back();
    }

    private function sync(Enrollment $enrollment, Course $course): void
    {
        if ($enrollment->completed_at) {
            return;
        }

        if (! Schema::hasTable('module_completions')) {
            return;
        }

        $total = $course->modules()->count();
        $done = ModuleCompletion::where('user_id', $enrollment->user_id)
            ->where('course_id', $course->id)
            ->count();

        $enrollment->update([
            'progress' => $total ? round($done / $total * 100, 2) : 0,
        ]);
    }
}
