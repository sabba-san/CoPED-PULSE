<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $courses = Course::with('instructor')
            ->where('instructor_id', auth()->id())
            ->withCount(['modules', 'enrollments'])
            ->withAvg('enrollments as avg_progress', 'progress')
            ->latest()
            ->paginate(10);

        return Inertia::render('design_v1/Staff/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('design_v1/Staff/Courses/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
            'academic_year' => ['nullable', 'string', 'max:100'],
            'category_logo' => ['nullable', 'string', 'max:50'],
            'billing_type' => ['nullable', 'string', 'in:free,one_time,subscription'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'cert_title' => ['nullable', 'string', 'max:255'],
            'cert_url' => ['nullable', 'url', 'max:500'],
            'bundle_title' => ['nullable', 'string', 'max:255'],
            'bundle_url' => ['nullable', 'url', 'max:500'],
        ]);

        $themeColors = collect(['blue', 'emerald', 'amber', 'navy', 'rose', 'charcoal']);
        $validated['academic_year'] = !empty($validated['academic_year']) ? $validated['academic_year'] : '2026 / 2027';
        $validated['category_logo'] = !empty($validated['category_logo']) ? $validated['category_logo'] : $themeColors->random();
        $validated['billing_type'] = !empty($validated['billing_type']) ? $validated['billing_type'] : 'free';
        $validated['price'] = isset($validated['price']) && $validated['price'] !== '' ? $validated['price'] : 0.00;

        $course = new Course($validated);
        $course->instructor()->associate($request->user());
        if (Schema::hasColumn('courses', 'organization_id') && Schema::hasTable('organizations')) {
            $course->organization()->associate($request->user()->organization);
        }
        $course->save();

        if ($request->boolean('redirect_to_hub')) {
            return redirect()->route('staff.courses.edit', $course->id)
                ->with('success', 'Subject created! Choose an action below to build your curriculum.');
        }

        return redirect()->route('staff.courses.index')
            ->with('success', 'Course created successfully.');
    }

    public function show(Course $course): Response
    {
        $this->authorize('view', $course);

        $course->load([
            'instructor:id,name,email',
            'modules' => function($q) {
                $q->orderBy('order');
            },
            'modules.lessons',
            'assessments',
        ]);

        $enrolledCount = $course->enrollments()->count();
        $moduleCompletions = \Illuminate\Support\Facades\Schema::hasTable('module_completions')
            ? \App\Models\ModuleCompletion::where('course_id', $course->id)
                ->selectRaw('module_id, count(distinct user_id) as completions_count')
                ->groupBy('module_id')
                ->pluck('completions_count', 'module_id')
            : collect();

        foreach ($course->modules as $m) {
            $m->completions_count = $moduleCompletions[$m->id] ?? 0;
        }

        return Inertia::render('design_v1/Staff/Courses/Show', [
            'course' => $course,
            'enrolledCount' => $enrolledCount,
        ]);
    }

    public function edit(Course $course): Response
    {
        $this->authorize('update', $course);

        $course->load([
            'instructor:id,name,email',
            'modules' => function($q) {
                $q->orderBy('order');
            },
            'modules.lessons',
            'assessments',
        ]);

        $enrolledCount = $course->enrollments()->count();
        $moduleCompletions = \Illuminate\Support\Facades\Schema::hasTable('module_completions')
            ? \App\Models\ModuleCompletion::where('course_id', $course->id)
                ->selectRaw('module_id, count(distinct user_id) as completions_count')
                ->groupBy('module_id')
                ->pluck('completions_count', 'module_id')
            : collect();

        foreach ($course->modules as $m) {
            $m->completions_count = $moduleCompletions[$m->id] ?? 0;
        }

        return Inertia::render('design_v1/Staff/Courses/Edit', [
            'course' => $course,
            'enrolledCount' => $enrolledCount,
        ]);
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
            'academic_year' => ['nullable', 'string', 'max:100'],
            'category_logo' => ['nullable', 'string', 'max:50'],
            'billing_type' => ['nullable', 'string', 'in:free,one_time,subscription'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'cert_title' => ['nullable', 'string', 'max:255'],
            'cert_url' => ['nullable', 'url', 'max:500'],
            'bundle_title' => ['nullable', 'string', 'max:255'],
            'bundle_url' => ['nullable', 'url', 'max:500'],
        ]);

        if (array_key_exists('academic_year', $validated)) {
            $validated['academic_year'] = !empty($validated['academic_year']) ? $validated['academic_year'] : '2026 / 2027';
        }
        if (array_key_exists('category_logo', $validated)) {
            $validated['category_logo'] = !empty($validated['category_logo']) ? $validated['category_logo'] : 'charcoal';
        }
        if (array_key_exists('billing_type', $validated)) {
            $validated['billing_type'] = !empty($validated['billing_type']) ? $validated['billing_type'] : 'free';
        }
        if (array_key_exists('price', $validated)) {
            $validated['price'] = isset($validated['price']) && $validated['price'] !== '' ? $validated['price'] : 0.00;
        }

        $course->update($validated);

        return redirect()->route('staff.courses.index')
            ->with('success', 'Course updated successfully.');
    }

    public function deploy(Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $course->update(['status' => 'published']);

        return back()->with('success', 'Course deployed and live in the CoPED Catalog!');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);

        $course->delete();

        return redirect()->route('staff.courses.index')
            ->with('success', 'Course deleted successfully.');
    }
}