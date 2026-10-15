<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Module;
use App\Models\ModuleFeedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class FeedbackController extends Controller
{
    /**
     * Save a thumbs reaction and/or a report for a module.
     * Empty submit removes the row.
     */
    public function store(Request $request, Course $course, Module $module)
    {
        abort_if($course->status !== 'published', 404);
        abort_if($module->course_id !== $course->id, 404);

        Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->firstOrFail();

        if (! Schema::hasTable('module_feedback')) {
            return back()->with('error', 'Feedback is unavailable right now. Please ask an administrator to run migrations.');
        }

        $validated = $request->validate([
            'reaction' => ['nullable', 'in:up,down'],
            'report' => ['nullable', 'string', 'max:2000'],
        ]);

        $reaction = $validated['reaction'] ?? null;
        $report = ! empty($validated['report']) ? $validated['report'] : null;

        if ($reaction === null && $report === null) {
            ModuleFeedback::where('user_id', $request->user()->id)
                ->where('module_id', $module->id)
                ->delete();

            return $request->wantsJson()
                ? response()->json(['deleted' => true])
                : back();
        }

        $feedback = ModuleFeedback::updateOrCreate(
            ['user_id' => $request->user()->id, 'module_id' => $module->id],
            ['course_id' => $course->id, 'reaction' => $reaction, 'report' => $report]
        );

        return $request->wantsJson()
            ? response()->json($feedback)
            : back()->with('success', 'Thanks for your feedback.');
    }

    public function destroy(Request $request, Course $course, Module $module)
    {
        abort_if($module->course_id !== $course->id, 404);

        ModuleFeedback::where('user_id', $request->user()->id)
            ->where('module_id', $module->id)
            ->delete();

        return $request->wantsJson()
            ? response()->json(['deleted' => true])
            : back();
    }
}
