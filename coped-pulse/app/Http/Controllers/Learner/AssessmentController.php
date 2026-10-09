<?php

namespace App\Http\Controllers\Learner;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Http\Request;

class AssessmentController extends Controller
{
    /**
     * Evaluate submitted quiz answers and update the learner's progress.
     *
     * Expects: answers = [ assessment_id => 'a'|'b'|'c'|'d' ]
     * Passing = 100%. On pass: progress = 100.00, completed_at = now().
     * On fail: progress = score %, completed_at = null (retry allowed).
     */
    public function assess(Request $request, Course $course)
    {
        abort_if($course->status !== 'published', 404);

        $enrollment = Enrollment::where('user_id', $request->user()->id)
            ->where('course_id', $course->id)
            ->firstOrFail();

        $validated = $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['required', 'string', 'in:a,b,c,d,A,B,C,D'],
        ]);

        $assessments = $course->assessments()->get();

        if ($assessments->isEmpty()) {
            return back()->with('error', 'No assessment available for this course yet.');
        }

        $submitted = collect($validated['answers'])
            ->mapWithKeys(fn ($value, $key) => [(int) $key => strtolower($value)]);

        $correct = $assessments->filter(
            fn ($a) => ($submitted[$a->id] ?? null) === strtolower($a->correct_option)
        )->count();

        $total = $assessments->count();
        $score = $total > 0 ? round(($correct / $total) * 100, 2) : 0;
        $passed = $correct === $total;

        $enrollment->update([
            'progress' => $score,
            'completed_at' => $passed ? now() : null,
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'score' => $score,
                'correct' => $correct,
                'total' => $total,
                'passed' => $passed,
            ]);
        }

        if ($passed) {
            return back()->with([
                'success' => 'Congratulations! You passed and completed the course.',
                'assessment_score' => $score,
                'assessment_passed' => true,
            ]);
        }

        return back()->with([
            'success' => "You scored {$score}% ({$correct}/{$total} correct). Try again to reach 100%.",
            'assessment_score' => $score,
            'assessment_passed' => false,
        ]);
    }
}
