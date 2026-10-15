<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Module;
use App\Models\Note;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class NoteController extends Controller
{
    /**
     * Save (create or update) the authenticated learner's note for a module.
     * Single upsert endpoint — no page reload (preserveScroll/preserveState client-side).
     */
    public function store(Request $request, Course $course, Module $module)
    {
        abort_if($course->status !== 'published', 404);
        abort_if($module->course_id !== $course->id, 404);

        Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->firstOrFail();

        if (! Schema::hasTable('notes')) {
            return back()->with('error', 'Notes are unavailable right now. Please ask an administrator to run migrations.');
        }

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:10000'],
        ]);

        $note = Note::updateOrCreate(
            ['user_id' => $request->user()->id, 'module_id' => $module->id],
            ['course_id' => $course->id, 'content' => $validated['content']]
        );

        if ($request->wantsJson()) {
            return response()->json($note);
        }

        return back()->with('success', 'Note saved.');
    }

    public function destroy(Request $request, Course $course, Module $module)
    {
        abort_if($module->course_id !== $course->id, 404);

        Note::where('user_id', $request->user()->id)
            ->where('module_id', $module->id)
            ->delete();

        if ($request->wantsJson()) {
            return response()->json(['deleted' => true]);
        }

        return back();
    }
}
