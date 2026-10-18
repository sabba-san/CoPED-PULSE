<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $query = Course::with('instructor')
            ->withCount('modules')
            ->where('status', 'published');

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            });
        }

        $courses = $query->latest()->get();

        return Inertia::render('design_v1/Learner/Catalog', [
            'courses' => $courses,
            'enrolledCourseIds' => $request->user()
                ? $request->user()->enrollments()->pluck('course_id')->all()
                : [],
            'filters' => [
                'q' => (string) $request->query('q', ''),
            ],
        ]);
    }

    public function enroll(Course $course, Request $request)
    {
        abort_if($course->status !== 'published', 404);

        $alreadyEnrolled = $request->user()->enrollments()->where('course_id', $course->id)->exists();

        if (!$alreadyEnrolled) {
            $request->user()->enrollments()->create([
                'course_id' => $course->id,
            ]);
        }

        return redirect()->route('portal')->with('success', 'Successfully enrolled in course!');
    }
}