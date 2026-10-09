<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Models\Course;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Route;

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

    Route::get('/dashboard', function () {
        return inertia('design_v1/Staff/Dashboard');
    })->middleware('role:staff')->name('dashboard');

    Route::get('/portal', function () {
        $enrollments = Enrollment::with('course.instructor')
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(10);

        return inertia('design_v1/Learner/Portal', [
            'enrollments' => $enrollments,
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

            return inertia('design_v1/Learner/Course/Learn', [
                'course' => $course,
                'enrollment' => $enrollment,
            ]);
        })->name('course.learn');

        Route::post('courses/{course}/assess', [\App\Http\Controllers\Learner\AssessmentController::class, 'assess'])->name('course.assess');
    });

    Route::middleware('role:staff')->prefix('staff')->name('staff.')->group(function () {
        Route::resource('courses', \App\Http\Controllers\Staff\CourseController::class);
        Route::resource('courses.modules', \App\Http\Controllers\Staff\ModuleController::class)
            ->only(['store', 'update', 'destroy']);
        Route::resource('courses.assessments', \App\Http\Controllers\Staff\AssessmentController::class)
            ->only(['store', 'destroy']);
    });
});