<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseMessage;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CourseChatController extends Controller
{
    /**
     * Authorize user access to the course chat.
     */
    protected function authorizeCourseAccess($user, Course $course): void
    {
        if (! $user) {
            abort(401);
        }

        if ($user->isCoordinator() || $user->isPlatformStaff()) {
            return;
        }

        if ($course->instructor_id === $user->id) {
            return;
        }

        if ($user->isStaff() && $course->organization_id && $course->organization_id === $user->organization_id) {
            return;
        }

        if ($user->isLearner()) {
            $isEnrolled = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->exists();

            if ($isEnrolled) {
                return;
            }
        }

        abort(403, 'Unauthorized access to course chat.');
    }

    /**
     * List chat messages for the course.
     */
    public function index(Request $request, Course $course): JsonResponse
    {
        $user = $request->user();
        $this->authorizeCourseAccess($user, $course);

        $query = CourseMessage::where('course_id', $course->id);

        if ($user->isLearner()) {
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();
            $enrollmentDate = $enrollment?->created_at ?? $enrollment?->enrolled_at;

            // Strict Nested Eloquent Scoping for Learner Message Privacy & Post-Enrollment Gate
            $query->where(function ($q) use ($user, $enrollmentDate) {
                $q->where(function ($sub) use ($enrollmentDate) {
                    $sub->whereNull('recipient_id');
                    if ($enrollmentDate) {
                        $sub->where('created_at', '>=', $enrollmentDate);
                    }
                })
                ->orWhere('sender_id', $user->id)
                ->orWhere('recipient_id', $user->id);
            });
        }

        $messages = $query->with(['sender:id,name,email,role,phone', 'recipient:id,name,email,role,phone'])
            ->orderBy('created_at', 'asc')
            ->limit(200)
            ->get();

        return response()->json($messages);
    }

    /**
     * Send a new message in the course chat.
     */
    public function store(Request $request, Course $course): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $this->authorizeCourseAccess($user, $course);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
            'recipient_id' => ['nullable', 'exists:users,id'],
        ]);

        $message = CourseMessage::create([
            'course_id' => $course->id,
            'sender_id' => $user->id,
            'recipient_id' => $validated['recipient_id'] ?? null,
            'body' => $validated['body'],
        ]);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(
                $message->load(['sender:id,name,email,role,phone', 'recipient:id,name,email,role,phone']),
                201
            );
        }

        return back()->with('success', 'Message sent.');
    }

    /**
     * Mark unread messages in the course chat as read.
     */
    public function markRead(Request $request, Course $course): JsonResponse|RedirectResponse
    {
        $user = $request->user();
        $this->authorizeCourseAccess($user, $course);

        $query = CourseMessage::where('course_id', $course->id)
            ->whereNull('read_at')
            ->where('sender_id', '!=', $user->id);

        if ($user->isLearner()) {
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();
            $enrollmentDate = $enrollment?->created_at ?? $enrollment?->enrolled_at;

            $query->where(function ($q) use ($user, $enrollmentDate) {
                $q->where(function ($sub) use ($enrollmentDate) {
                    $sub->whereNull('recipient_id');
                    if ($enrollmentDate) {
                        $sub->where('created_at', '>=', $enrollmentDate);
                    }
                })
                ->orWhere('recipient_id', $user->id);
            });
        } else {
            $query->where(function ($q) use ($user) {
                $q->whereNull('recipient_id')
                    ->orWhere('recipient_id', $user->id);
            });
        }

        $query->update(['read_at' => now()]);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['status' => 'ok']);
        }

        return back();
    }
}
