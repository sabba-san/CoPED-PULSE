<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Staff\StoreAssessmentRequest;
use App\Http\Requests\Staff\UpdateAssessmentRequest;
use App\Models\Assessment;
use App\Models\Course;
use Inertia\Inertia;
use Inertia\Response;

class AssessmentController extends Controller
{
    /**
     * Dedicated final-exam page: list / add / edit / delete
     * course-wide questions (module_id null).
     */
    public function index(Course $course): Response
    {
        $this->authorize('update', $course);

        $assessments = $course->assessments()->final()->get();

        return Inertia::render('design_v1/Staff/Assessments/Index', [
            'course' => $course->only('id', 'title'),
            'assessments' => $assessments,
        ]);
    }

    public function store(StoreAssessmentRequest $request, Course $course)
    {
        $course->assessments()->create($request->validated());

        return back()->with('success', 'Quiz question added successfully.');
    }

    public function update(UpdateAssessmentRequest $request, Course $course, Assessment $assessment)
    {
        abort_if($assessment->course_id !== $course->id, 404);
        $this->authorize('update', $assessment);

        $assessment->update($request->validated());

        return back()->with('success', 'Quiz question updated successfully.');
    }

    public function destroy(Course $course, Assessment $assessment)
    {
        $this->authorize('update', $course);

        abort_if($assessment->course_id !== $course->id, 404);
        $this->authorize('delete', $assessment);

        $assessment->delete();

        return back()->with('success', 'Quiz question deleted successfully.');
    }
}
