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

        $assessments = $course->assessments()->whereNull('module_id')->get();

        if ($assessments->isEmpty()) {
            return back()->with('error', 'No final assessment available for this course yet.');
        }

        $submitted = collect($validated['answers'])
            ->mapWithKeys(fn ($value, $key) => [(int) $key => strtolower($value)]);

        $correctAssessments = $assessments->filter(
            fn ($a) => ($submitted[$a->id] ?? null) === strtolower($a->correct_option)
        );
        $correct = $correctAssessments->count();
        $correctIds = $correctAssessments->pluck('id')->values()->all();

        $total = $assessments->count();
        $score = $total > 0 ? round(($correct / $total) * 100, 2) : 0;
        $passed = $correct === $total;

        // Never drop or reset progress if quiz score < 100.
        // Progress strictly retains current percentage and only updates to 100% upon passing.
        if ($passed) {
            $enrollment->update([
                'progress' => 100,
                'completed_at' => now(),
            ]);
        }

        $assessmentResults = [
            'correct_ids' => $correctIds,
            'submitted' => $submitted->all(),
            'total' => $total,
            'correct' => $correct,
            'score' => $score,
            'passed' => $passed,
        ];

        if ($request->wantsJson()) {
            return response()->json([
                'score' => $score,
                'correct' => $correct,
                'total' => $total,
                'passed' => $passed,
                'assessment_results' => $assessmentResults,
            ]);
        }

        if ($passed) {
            return back()->with([
                'success' => "Assessment passed! All {$total} questions correct. Your certificate is now unlocked.",
                'assessment_score' => $score,
                'assessment_passed' => true,
                'assessment_results' => $assessmentResults,
            ]);
        }

        return back()->with([
            'error' => "Assessment needs review: {$correct} of {$total} answers correct. Check the highlighted questions below or click Restart Quiz.",
            'assessment_score' => $score,
            'assessment_passed' => false,
            'assessment_results' => $assessmentResults,
        ]);
    }
}
