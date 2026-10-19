<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Module;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $instructorId = auth()->id();

        // One pluck, reused - avoids repeated instructor joins.
        $courseIds = Course::where('instructor_id', $instructorId)->pluck('id');

        $enrollQuery = Enrollment::whereIn('course_id', $courseIds);

        $stats = [
            'total_courses' => $courseIds->count(),
            'total_modules' => $courseIds->isNotEmpty()
                ? Module::whereIn('course_id', $courseIds)->count()
                : 0,
            'total_enrollments' => (clone $enrollQuery)->count(),
            'active_learners' => (clone $enrollQuery)->distinct('user_id')->count('user_id'),
            'completed' => (clone $enrollQuery)->whereNotNull('completed_at')->count(),
            'in_progress' => (clone $enrollQuery)->whereNull('completed_at')->count(),
            'avg_completion' => round((clone $enrollQuery)->avg('progress') ?? 0, 1),
        ];

        // Per-course list: all instructor courses with counts + avg progress
        $courses = Course::where('instructor_id', $instructorId)
            ->withCount(['modules', 'enrollments'])
            ->withAvg('enrollments as avg_progress', 'progress')
            ->withCount(['enrollments as completed_count' => fn ($q) => $q->whereNotNull('completed_at')])
            ->latest()
            ->get();

        // Recent activity feed: 10 rows max with learner and course relationships + module telemetry
        $recentEnrollments = $courseIds->isNotEmpty()
            ? Enrollment::whereIn('course_id', $courseIds)
                ->with(['user:id,name,email', 'course:id,title'])
                ->latest('updated_at')
                ->limit(10)
                ->get()
            : collect();

        $recentActivity = $recentEnrollments->map(function ($enrollment) {
            $totalModules = $enrollment->course ? $enrollment->course->modules()->count() : 0;
            $completedCount = 0;
            $latestModuleTitle = null;

            if (\Illuminate\Support\Facades\Schema::hasTable('module_completions')) {
                $latestCompletion = \App\Models\ModuleCompletion::where('user_id', $enrollment->user_id)
                    ->where('course_id', $enrollment->course_id)
                    ->latest('completed_at')
                    ->with('module:id,title')
                    ->first();

                $completedCount = \App\Models\ModuleCompletion::where('user_id', $enrollment->user_id)
                    ->where('course_id', $enrollment->course_id)
                    ->count();

                $latestModuleTitle = $latestCompletion?->module?->title;
            }

            $enrollment->completed_modules_count = $completedCount;
            $enrollment->total_modules_count = $totalModules;
            $enrollment->latest_module_title = $latestModuleTitle;
            $enrollment->assessment_status = $enrollment->completed_at ? 'certified' : 'pending';

            return $enrollment;
        });

        return Inertia::render('design_v1/Staff/Dashboard', [
            'stats' => $stats,
            'courses' => $courses,
            'breakdown' => $courses,
            'recentActivity' => $recentActivity,
        ]);
    }
}
