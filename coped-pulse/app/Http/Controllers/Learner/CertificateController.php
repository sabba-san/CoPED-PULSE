<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CertificateController extends Controller
{
    public function show(Request $request, Course $course): Response|RedirectResponse
    {
        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->firstOrFail();

        $isCompleted = !is_null($enrollment->completed_at) || (float) $enrollment->progress >= 100;

        if (!$isCompleted) {
            return redirect()->route('learner.course.learn', $course->id)
                ->with('error', 'Complete all modules and pass the Final Assessment with 100% to unlock your official certificate.');
        }

        $course->load('instructor:id,name,email');

        return Inertia::render('design_v1/Learner/Course/Certificate', [
            'course' => $course,
            'enrollment' => $enrollment,
        ]);
    }
}
