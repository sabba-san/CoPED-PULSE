<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Module;
use App\Models\ModuleCompletion;
use App\Models\Note;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;

Route::get('/', function () {
    if (auth()->check()) {
        return auth()->user()->isStaff()
            ? redirect()->route('dashboard')
            : redirect()->route('portal');
    }
    return inertia('design_v1/Welcome');
})->name('home');

Route::middleware('redirect.auth')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);

    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', \App\Http\Controllers\Staff\DashboardController::class)->middleware('role:staff')->name('dashboard');

    Route::get('/portal', function () {
        $base = Enrollment::where('user_id', auth()->id());

        $stats = [
            'enrolled' => (clone $base)->count(),
            'completed' => (clone $base)->whereNotNull('completed_at')->count(),
            'in_progress' => (clone $base)->whereNull('completed_at')->count(),
            'overall_pct' => round((clone $base)->avg('progress') ?? 0),
            'modules_completed' => Schema::hasTable('module_completions')
                ? ModuleCompletion::where('user_id', auth()->id())->count()
                : 0,
        ];

        $enrollments = (clone $base)->with('course.instructor')
            ->latest()
            ->paginate(10);

        return inertia('design_v1/Learner/Portal', [
            'enrollments' => $enrollments,
            'stats' => $stats,
        ]);
    })->middleware('role:learner')->name('portal');

    Route::middleware('role:learner')->prefix('learner')->name('learner.')->group(function () {
        Route::get('catalog', [\App\Http\Controllers\Learner\CatalogController::class, 'index'])->name('catalog');
        Route::post('catalog/{course}/enroll', [\App\Http\Controllers\Learner\CatalogController::class, 'enroll'])->name('catalog.enroll');

        Route::get('courses/{course}/learn', function (Course $course) {
            abort_if($course->status !== 'published', 404);

            $enrollment = Enrollment::where('user_id', auth()->id())
                ->where('course_id', $course->id)
                ->firstOrFail();

            $course->load(['modules.lessons', 'assessments']);

            $completedModuleIds = Schema::hasTable('module_user')
                ? auth()->user()->completedModules()->whereIn('modules.id', $course->modules()->pluck('id'))->pluck('modules.id')
                : (Schema::hasTable('module_completions')
                    ? ModuleCompletion::where('user_id', auth()->id())
                        ->where('course_id', $course->id)
                        ->pluck('module_id')
                    : collect());

            $notes = [];
            if (Schema::hasTable('notes')) {
                $notes = Note::where('user_id', auth()->id())
                    ->where('course_id', $course->id)
                    ->get()
                    ->mapWithKeys(fn ($n) => [$n->module_id => [
                        'content' => $n->content,
                        'updated_at' => $n->updated_at,
                    ]])
                    ->all();
            }

            $completedLessonIds = Schema::hasTable('lesson_completions')
                ? \App\Models\LessonCompletion::where('user_id', auth()->id())
                    ->where('course_id', $course->id)
                    ->pluck('lesson_id')
                : collect();

            $todayCount = 0;
            if (Schema::hasTable('module_completions')) {
                $todayCount += ModuleCompletion::where('user_id', auth()->id())
                    ->where('course_id', $course->id)
                    ->whereDate('completed_at', today())
                    ->count();
            }
            if (Schema::hasTable('lesson_completions')) {
                $todayCount += \App\Models\LessonCompletion::where('user_id', auth()->id())
                    ->where('course_id', $course->id)
                    ->whereDate('completed_at', today())
                    ->count();
            }

            $dailyGoal = Schema::hasColumn('users', 'daily_goal_items')
                ? (auth()->user()->daily_goal_items ?? 3)
                : 3;

            return inertia('design_v1/Learner/Course/Learn', [
                'course' => $course,
                'enrollment' => $enrollment,
                'completedModuleIds' => $completedModuleIds,
                'completedLessonIds' => $completedLessonIds,
                'todayCount' => $todayCount,
                'dailyGoal' => $dailyGoal,
                'notes' => $notes,
                'feedback' => Schema::hasTable('module_feedback')
                    ? \App\Models\ModuleFeedback::where('user_id', auth()->id())
                        ->where('course_id', $course->id)
                        ->get()
                        ->mapWithKeys(fn ($f) => [$f->module_id => [
                            'reaction' => $f->reaction,
                            'has_report' => ! empty($f->report),
                        ]])
                        ->all()
                    : [],
            ]);
        })->name('course.learn');

        Route::get('courses/{course}/certificate', [\App\Http\Controllers\Learner\CertificateController::class, 'show'])->name('course.certificate');

        Route::get('courses/{course}/modules/{module}/learn', function (Course $course, Module $module) {
            abort_if($course->status !== 'published', 404);
            abort_if($module->course_id !== $course->id, 404);

            $enrollment = Enrollment::where('user_id', auth()->id())
                ->where('course_id', $course->id)
                ->firstOrFail();

            $course->load(['modules.lessons', 'assessments']);
            $module->load(['lessons']);

            $completedModuleIds = Schema::hasTable('module_user')
                ? auth()->user()->completedModules()->whereIn('modules.id', $course->modules()->pluck('id'))->pluck('modules.id')
                : (Schema::hasTable('module_completions')
                    ? ModuleCompletion::where('user_id', auth()->id())
                        ->where('course_id', $course->id)
                        ->pluck('module_id')
                    : collect());

            $completedLessonIds = Schema::hasTable('lesson_completions')
                ? \App\Models\LessonCompletion::where('user_id', auth()->id())
                    ->where('course_id', $course->id)
                    ->pluck('lesson_id')
                : collect();

            $todayCount = 0;
            if (Schema::hasTable('module_completions')) {
                $todayCount += ModuleCompletion::where('user_id', auth()->id())
                    ->where('course_id', $course->id)
                    ->whereDate('completed_at', today())
                    ->count();
            }
            if (Schema::hasTable('lesson_completions')) {
                $todayCount += \App\Models\LessonCompletion::where('user_id', auth()->id())
                    ->where('course_id', $course->id)
                    ->whereDate('completed_at', today())
                    ->count();
            }

            $dailyGoal = Schema::hasColumn('users', 'daily_goal_items')
                ? (auth()->user()->daily_goal_items ?? 3)
                : 3;

            $notes = [];
            if (Schema::hasTable('notes')) {
                $notes = Note::where('user_id', auth()->id())
                    ->where('course_id', $course->id)
                    ->get()
                    ->mapWithKeys(fn ($n) => [$n->module_id => [
                        'content' => $n->content,
                        'updated_at' => $n->updated_at,
                    ]])
                    ->all();
            }

            return inertia('design_v1/Learner/Course/Module', [
                'course' => $course,
                'module' => $module,
                'enrollment' => $enrollment,
                'completedModuleIds' => $completedModuleIds,
                'completedLessonIds' => $completedLessonIds,
                'todayCount' => $todayCount,
                'dailyGoal' => $dailyGoal,
                'notes' => $notes,
                'feedback' => Schema::hasTable('module_feedback')
                    ? \App\Models\ModuleFeedback::where('user_id', auth()->id())
                        ->where('course_id', $course->id)
                        ->get()
                        ->mapWithKeys(fn ($f) => [$f->module_id => [
                            'reaction' => $f->reaction,
                            'has_report' => ! empty($f->report),
                        ]])
                        ->all()
                    : [],
            ]);
        })->name('course.module.learn');

        Route::post('courses/{course}/assess', [\App\Http\Controllers\Learner\AssessmentController::class, 'assess'])->name('course.assess');
        Route::post('courses/{course}/modules/{module}/complete', [\App\Http\Controllers\Learner\ModuleCompletionController::class, 'store'])->name('course.module.complete');
        Route::delete('courses/{course}/modules/{module}/complete', [\App\Http\Controllers\Learner\ModuleCompletionController::class, 'destroy'])->name('course.module.uncomplete');
        // Plural aliases for frontend robustness
        Route::post('courses/{course}/modules/{module}/complete-alias', [\App\Http\Controllers\Learner\ModuleCompletionController::class, 'store'])->name('course.modules.complete');
        Route::delete('courses/{course}/modules/{module}/complete-alias', [\App\Http\Controllers\Learner\ModuleCompletionController::class, 'destroy'])->name('course.modules.uncomplete');
        Route::post('courses/{course}/modules/{module}/lessons/{lesson}/complete', [\App\Http\Controllers\Learner\ProgressController::class, 'lessonComplete'])->name('course.module.lesson.complete');
        Route::delete('courses/{course}/modules/{module}/lessons/{lesson}/complete', [\App\Http\Controllers\Learner\ProgressController::class, 'lessonUncomplete'])->name('course.module.lesson.uncomplete');
        Route::put('goal', [\App\Http\Controllers\Learner\GoalController::class, 'update'])->name('goal.update');
        Route::post('courses/{course}/modules/{module}/notes', [\App\Http\Controllers\Learner\NoteController::class, 'store'])->name('course.module.note.store');
        Route::delete('courses/{course}/modules/{module}/notes', [\App\Http\Controllers\Learner\NoteController::class, 'destroy'])->name('course.module.note.destroy');
        Route::post('courses/{course}/modules/{module}/feedback', [\App\Http\Controllers\Learner\FeedbackController::class, 'store'])->name('course.module.feedback.store');
        Route::delete('courses/{course}/modules/{module}/feedback', [\App\Http\Controllers\Learner\FeedbackController::class, 'destroy'])->name('course.module.feedback.destroy');
    });

    Route::middleware('role:staff')->prefix('staff')->name('staff.')->group(function () {
        Route::get('organization', [\App\Http\Controllers\Staff\OrganizationController::class, 'show'])->name('organization.show');
        Route::resource('courses', \App\Http\Controllers\Staff\CourseController::class);
        Route::post('courses/{course}/deploy', [\App\Http\Controllers\Staff\CourseController::class, 'deploy'])->name('courses.deploy');
        Route::resource('courses.modules', \App\Http\Controllers\Staff\ModuleController::class)
            ->only(['store', 'edit', 'update', 'destroy']);
        Route::resource('courses.modules.lessons', \App\Http\Controllers\Staff\LessonController::class)
            ->only(['store', 'update', 'destroy']);
        Route::resource('courses.assessments', \App\Http\Controllers\Staff\AssessmentController::class)
            ->only(['index', 'store', 'update', 'destroy']);
    });
});