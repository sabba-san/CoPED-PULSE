<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseMessage;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isCoordinator = $user->isCoordinator();

        $query = Course::with('instructor:id,name,email,role')
            ->withCount(['modules', 'enrollments'])
            ->withAvg('enrollments as avg_progress', 'progress');

        if ($isCoordinator) {
            if ($request->filled('instructor_id')) {
                $query->where('instructor_id', $request->instructor_id);
            }
        } else {
            $query->where('instructor_id', $user->id);
        }

        $courses = $query->latest()->paginate(10)->withQueryString();

        $instructors = User::where('role', 'staff')->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('design_v1/Staff/Courses/Index', [
            'courses' => $courses,
            'instructors' => $instructors,
            'isCoordinator' => $isCoordinator,
            'selectedInstructorId' => $request->query('instructor_id'),
        ]);
    }

    public function create(Request $request): Response
    {
        $instructors = User::where('role', 'staff')->orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('design_v1/Staff/Courses/Create', [
            'instructors' => $instructors,
            'isCoordinator' => $request->user()->isCoordinator(),
        ]);
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
            'instructor_id' => ['nullable', 'exists:users,id'],
        ]);

        $themeColors = collect(['blue', 'emerald', 'amber', 'navy', 'rose', 'charcoal']);
        $validated['academic_year'] = !empty($validated['academic_year']) ? $validated['academic_year'] : '2026 / 2027';
        $validated['category_logo'] = !empty($validated['category_logo']) ? $validated['category_logo'] : $themeColors->random();
        $validated['billing_type'] = !empty($validated['billing_type']) ? $validated['billing_type'] : 'free';
        $validated['price'] = isset($validated['price']) && $validated['price'] !== '' ? $validated['price'] : 0.00;

        $course = new Course($validated);

        if ($request->user()->isCoordinator() && $request->filled('instructor_id')) {
            $assignedInstructor = User::where('role', 'staff')->findOrFail($request->instructor_id);
            $course->instructor()->associate($assignedInstructor);
            $course->organization_id = $assignedInstructor->organization_id ?? $request->user()->organization_id;
        } else {
            $course->instructor()->associate($request->user());
            if (Schema::hasColumn('courses', 'organization_id') && Schema::hasTable('organizations')) {
                $course->organization()->associate($request->user()->organization);
            }
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
            'instructor:id,name,email,role',
            'modules' => function($q) {
                $q->orderBy('order');
            },
            'modules.lessons',
            'assessments',
            'enrollments.user:id,name,email,role',
        ]);

        $enrolledCount = $course->enrollments()->count();
        $rawModuleCompletions = \Illuminate\Support\Facades\Schema::hasTable('module_completions')
            ? \App\Models\ModuleCompletion::where('course_id', $course->id)->get()
            : collect();

        $userCompletions = $rawModuleCompletions->groupBy('user_id');

        $moduleCounts = $rawModuleCompletions->groupBy('module_id')->map->count();
        foreach ($course->modules as $m) {
            $m->completions_count = $moduleCounts[$m->id] ?? 0;
        }

        $instructors = User::where('role', 'staff')->orderBy('name')->get(['id', 'name', 'email']);

        $chatMessages = Schema::hasTable('course_messages')
            ? CourseMessage::where('course_id', $course->id)
                ->with(['sender:id,name,email,role,phone', 'recipient:id,name,email,role,phone'])
                ->orderBy('created_at', 'asc')
                ->limit(200)
                ->get()
            : collect();

        return Inertia::render('design_v1/Staff/Courses/Show', [
            'course' => $course,
            'enrolledCount' => $enrolledCount,
            'moduleCompletions' => $userCompletions,
            'instructors' => $instructors,
            'isCoordinator' => auth()->user()->isCoordinator(),
            'chatMessages' => $chatMessages,
        ]);
    }

    public function edit(Course $course): Response
    {
        $this->authorize('update', $course);

        $course->load([
            'instructor:id,name,email,role,phone',
            'modules' => function($q) {
                $q->orderBy('order');
            },
            'modules.lessons',
            'assessments',
            'enrollments.user:id,name,email,role,phone',
        ]);

        $enrolledCount = $course->enrollments()->count();
        $rawModuleCompletions = \Illuminate\Support\Facades\Schema::hasTable('module_completions')
            ? \App\Models\ModuleCompletion::where('course_id', $course->id)->get()
            : collect();

        $userCompletions = $rawModuleCompletions->groupBy('user_id');

        $moduleCounts = $rawModuleCompletions->groupBy('module_id')->map->count();
        foreach ($course->modules as $m) {
            $m->completions_count = $moduleCounts[$m->id] ?? 0;
        }

        $instructors = User::where('role', 'staff')->orderBy('name')->get(['id', 'name', 'email']);

        $chatMessages = Schema::hasTable('course_messages')
            ? CourseMessage::where('course_id', $course->id)
                ->with(['sender:id,name,email,role,phone', 'recipient:id,name,email,role,phone'])
                ->orderBy('created_at', 'asc')
                ->limit(200)
                ->get()
            : collect();

        return Inertia::render('design_v1/Staff/Courses/Edit', [
            'course' => $course,
            'enrolledCount' => $enrolledCount,
            'moduleCompletions' => $userCompletions,
            'instructors' => $instructors,
            'isCoordinator' => auth()->user()->isCoordinator(),
            'chatMessages' => $chatMessages,
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
            'instructor_id' => ['nullable', 'exists:users,id'],
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

        if ($request->user()->isCoordinator() && $request->has('instructor_id')) {
            if ($request->filled('instructor_id')) {
                $assignedInstructor = User::where('role', 'staff')->findOrFail($request->instructor_id);
                $course->instructor_id = $assignedInstructor->id;
                $course->organization_id = $assignedInstructor->organization_id ?? $course->organization_id;
            }
        }
        unset($validated['instructor_id']);

        $course->update($validated);

        return redirect()->route('staff.courses.index')
            ->with('success', 'Course updated successfully.');
    }

    public function assignInstructor(Request $request, Course $course): RedirectResponse
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'instructor_id' => ['required', 'exists:users,id'],
        ]);

        $assignedInstructor = User::where('role', 'staff')->findOrFail($validated['instructor_id']);
        $course->instructor_id = $assignedInstructor->id;
        $course->organization_id = $assignedInstructor->organization_id ?? $course->organization_id;
        $course->save();

        return back()->with('success', 'Instructor assigned to subject successfully.');
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