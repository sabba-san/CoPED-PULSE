<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(): Response
    {
        $courses = Course::with('instructor')
            ->where('instructor_id', auth()->id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Staff/Courses/Index', [
            'courses' => $courses,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Staff/Courses/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
        ]);

        $validated['instructor_id'] = auth()->id();

        Course::create($validated);

        return redirect()->route('staff.courses.index')
            ->with('success', 'Course created successfully.');
    }

    public function show(Course $course): Response
    {
        $course->load('modules.lessons');

        return Inertia::render('Staff/Courses/Show', [
            'course' => $course,
        ]);
    }

    public function edit(Course $course): Response
    {
        $this->authorize('update', $course);

        return Inertia::render('Staff/Courses/Edit', [
            'course' => $course,
        ]);
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', 'in:draft,published,archived'],
        ]);

        $course->update($validated);

        return redirect()->route('staff.courses.index')
            ->with('success', 'Course updated successfully.');
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->authorize('delete', $course);

        $course->delete();

        return redirect()->route('staff.courses.index')
            ->with('success', 'Course deleted successfully.');
    }
}