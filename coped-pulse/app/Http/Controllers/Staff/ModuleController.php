<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreModuleRequest;
use App\Http\Requests\Staff\UpdateModuleRequest;
use App\Models\Course;
use App\Models\Module;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class ModuleController extends Controller
{
    /**
     * When the POST body exceeds PHP's post_max_size, PHP empties $_POST/$_FILES
     * before Laravel runs, so normal validation would report confusing
     * "title is required" errors. Detect that case and return a clear message.
     */
    private function oversizedPost(Request $request): bool
    {
        return (int) $request->server('CONTENT_LENGTH', 0) > 0
            && empty($request->post())
            && empty($request->file());
    }

    /**
     * Staff enters duration in minutes; stored as seconds. Only keys
     * present in $validated are returned, so split forms (details vs
     * materials) never wipe each other's fields.
     */
    private function videoAttributes(array $validated): array
    {
        $out = [];

        if (array_key_exists('duration_minutes', $validated)) {
            $minutes = $validated['duration_minutes'];
            $out['duration'] = ($minutes === null || $minutes === '') ? null : max(0, (int) $minutes) * 60;
        }

        if (array_key_exists('transcript', $validated)) {
            $out['transcript'] = ! empty($validated['transcript']) ? $validated['transcript'] : null;
        }

        return array_filter(
            $out,
            fn ($value, $key) => Schema::hasColumn('modules', $key),
            ARRAY_FILTER_USE_BOTH
        );
    }

    public function store(StoreModuleRequest $request, Course $course)
    {
        if ($this->oversizedPost($request)) {
            return redirect()->back()->withErrors([
                'file' => 'File is too large. The upload exceeds the 15MB limit. Please choose a smaller file.',
            ]);
        }

        $validated = $request->validated();

        $filePath = null;

        // Handle File Upload if a document/slide is uploaded
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $filePath = $file->storeAs('modules', $filename, 'public');
            $validated['content_type'] = 'file';
            $validated['media_url'] = '/storage/' . $filePath;
        }

        $module = $course->modules()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'content_type' => $validated['content_type'] ?? 'link',
            'media_url' => $validated['media_url'] ?? null,
            'order' => ($course->modules()->max('order') ?? 0) + 1,
            ...$this->videoAttributes($validated),
        ]);

        return redirect()
            ->route('staff.courses.modules.edit', [$course, $module])
            ->with('success', 'Module created - now fill in its details below.');
    }

    public function update(UpdateModuleRequest $request, Course $course, Module $module)
    {
        abort_if($module->course_id !== $course->id, 404);
        $this->authorize('update', $module);

        if ($this->oversizedPost($request)) {
            return redirect()->back()->withErrors([
                'file' => 'File is too large. The upload exceeds the 15MB limit. Please choose a smaller file.',
            ]);
        }

        $validated = $request->validated();

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . preg_replace('/\s+/', '_', $file->getClientOriginalName());
            $filePath = $file->storeAs('modules', $filename, 'public');
            $validated['content_type'] = 'file';
            $validated['media_url'] = '/storage/' . $filePath;
        }

        $module->update(
            Arr::only($validated, ['title', 'description', 'content_type', 'media_url'])
            + $this->videoAttributes($validated)
        );

        return redirect()->back()->with('success', 'Module updated successfully!');
    }

    public function destroy(Course $course, Module $module)
    {
        $this->authorize('update', $course);

        abort_if($module->course_id !== $course->id, 404);
        $this->authorize('delete', $module);

        $module->delete();

        // Close ordering gap: 1,2,4 -> 1,2,3
        $course->modules()->orderBy('order')->each(function ($m, $i) {
            if ($m->order !== $i + 1) {
                $m->updateQuietly(['order' => $i + 1]);
            }
        });

        return redirect()->route('staff.courses.edit', $course)
            ->with('success', 'Module deleted successfully!');
    }

    public function edit(Course $course, Module $module): Response
    {
        $this->authorize('update', $course);

        abort_if($module->course_id !== $course->id, 404);
        $this->authorize('update', $module);

        $assessments = $course->assessments()->forModule($module->id)->get();
        $finalAssessments = $course->assessments()->final()->get();
        $course->load('assessments');
        $module->load('lessons');

        return Inertia::render('design_v1/Staff/Modules/Edit', [
            'course' => $course,
            'module' => $module,
            'assessments' => $assessments,
            'finalAssessments' => $finalAssessments,
        ]);
    }
}