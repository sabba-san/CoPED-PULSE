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

        $query = Course::with(['instructor', 'modules:id,course_id,title,description'])
            ->withCount('modules')
            ->where('status', 'published');

        if ($q !== '') {
            $tokens = preg_split('/\s+/', strtolower($q), -1, PREG_SPLIT_NO_EMPTY) ?: [];

            $query->where(function ($sub) use ($tokens) {
                foreach ($tokens as $token) {
                    // Institutional branding ("UUM · CoPED") applies to all published platform courses.
                    if (in_array($token, ['uum', 'coped'], true)) {
                        continue;
                    }

                    $sub->where(function ($termQuery) use ($token) {
                        $termQuery->where('title', 'like', "%{$token}%")
                            ->orWhere('description', 'like', "%{$token}%")
                            ->orWhere('cert_title', 'like', "%{$token}%")
                            ->orWhere('academic_year', 'like', "%{$token}%")
                            ->orWhere('category_logo', 'like', "%{$token}%")
                            ->orWhereHas('instructor', fn ($i) => $i->where('name', 'like', "%{$token}%"))
                            ->orWhereHas('modules', fn ($m) => $m
                                ->where('title', 'like', "%{$token}%")
                                ->orWhere('description', 'like', "%{$token}%"));
                    });
                }
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

        if ($request->boolean('redirect_to_learn')) {
            return redirect()->route('learner.course.learn', $course->id)
                ->with('success', 'Subscribed and enrolled! Welcome to your course.');
        }

        return redirect()->route('portal')->with('success', 'Successfully enrolled in course!');
    }
}