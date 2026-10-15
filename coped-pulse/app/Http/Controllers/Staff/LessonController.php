<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreLessonRequest;
use App\Http\Requests\Staff\UpdateLessonRequest;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Schema;

class LessonController extends Controller
{
    /** Max upload: 15MB (must stay below PHP post_max_size/upload_max_filesize). */
    private const MAX_FILE_KB = 15360;

    private function oversizedPost(Request $request): bool
    {
        return (int) $request->server('CONTENT_LENGTH', 0) > 0
            && empty($request->post())
            && empty($request->file());
    }

    /**
     * Drops keys whose columns don't exist yet (pending migrations),
     * so subtopic creation keeps working before `migrate` runs.
     */
    private function existingColumns(array $attributes): array
    {
        return array_filter(
            $attributes,
            fn ($value, $key) => Schema::hasColumn('lessons', $key),
            ARRAY_FILTER_USE_BOTH
        );
    }

    private function storeUploadedFile(Request $request, array &$validated): void
    {
        if (! $request->hasFile('file')) {
            return;
        }

        $file = $request->file('file');
        $filename = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
        $path = $file->storeAs('lessons', $filename, 'public');
        $validated['content_url'] = '/storage/' . $path;
    }

    public function store(StoreLessonRequest $request, Course $course, Module $module)
    {
        abort_if($module->course_id !== $course->id, 404);

        if ($this->oversizedPost($request)) {
            return redirect()->back()->withErrors([
                'file' => 'File is too large. The upload exceeds the 15MB limit. Please choose a smaller file.',
            ]);
        }

        $validated = $request->validated();
        $this->storeUploadedFile($request, $validated);

        $module->lessons()->create($this->existingColumns([
            'title' => $validated['title'],
            'content' => ! empty($validated['content']) ? $validated['content'] : null,
            'content_type' => $validated['content_type'],
            'content_url' => $validated['content_url'] ?? null,
            'transcript' => ! empty($validated['transcript']) ? $validated['transcript'] : null,
            'order' => ($module->lessons()->max('order') ?? 0) + 1,
        ]));

        return back()->with('success', 'Subtopic added.');
    }

    public function update(UpdateLessonRequest $request, Course $course, Module $module, Lesson $lesson)
    {
        abort_if($module->course_id !== $course->id, 404);
        abort_if($lesson->module_id !== $module->id, 404);
        $this->authorize('update', $module);

        if ($this->oversizedPost($request)) {
            return redirect()->back()->withErrors([
                'file' => 'File is too large. The upload exceeds the 15MB limit. Please choose a smaller file.',
            ]);
        }

        $validated = $request->validated();
        $this->storeUploadedFile($request, $validated);

        $lesson->update($this->existingColumns(
            Arr::only($validated, ['title', 'content', 'content_type', 'content_url', 'transcript'])
        ));

        return back()->with('success', 'Subtopic updated.');
    }

    public function destroy(Course $course, Module $module, Lesson $lesson)
    {
        $this->authorize('update', $course);

        abort_if($module->course_id !== $course->id, 404);
        abort_if($lesson->module_id !== $module->id, 404);
        $this->authorize('update', $module);

        $lesson->delete();

        $module->lessons()->orderBy('order')->each(function ($l, $i) {
            if ($l->order !== $i + 1) {
                $l->updateQuietly(['order' => $i + 1]);
            }
        });

        return back()->with('success', 'Subtopic deleted.');
    }
}
