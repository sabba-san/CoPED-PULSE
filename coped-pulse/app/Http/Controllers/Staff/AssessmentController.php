<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Assessment;
use App\Models\Course;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    public function store(Request $request, Course $course)
    {
        $this->authorize('update', $course);

        $validated = $request->validate([
            'question' => 'required|string',
            'option_a' => 'required|string|max:255',
            'option_b' => 'required|string|max:255',
            'option_c' => 'required|string|max:255',
            'option_d' => 'required|string|max:255',
            'correct_option' => 'required|in:a,b,c,d',
        ]);

        $course->assessments()->create($validated);

        return back()->with('success', 'Quiz question added successfully.');
    }

    public function destroy(Course $course, Assessment $assessment)
    {
        $this->authorize('update', $course);

        abort_if($assessment->course_id !== $course->id, 404);

        $assessment->delete();

        return back()->with('success', 'Quiz question deleted successfully.');
    }
}
