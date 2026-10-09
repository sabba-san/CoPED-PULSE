<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CatalogController extends Controller
{
    public function index()
    {
        $courses = Course::with('instructor')
            ->where('status', 'published')
            ->latest()
            ->get();

        return Inertia::render('design_v1/Learner/Catalog', [
            'courses' => $courses,
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
