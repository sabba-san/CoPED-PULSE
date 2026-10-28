<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'assessment_score' => fn () => $request->session()->get('assessment_score'),
                'assessment_passed' => fn () => $request->session()->get('assessment_passed'),
                'assessment_results' => fn () => $request->session()->get('assessment_results'),
                'quiz_score' => fn () => $request->session()->get('assessment_score') ?? $request->session()->get('quiz_score'),
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'unreadChatSummary' => fn () => $this->getUnreadChatSummary($request->user()),
        ];
    }

    /**
     * Get unread chat summary for the authenticated user.
     */
    protected function getUnreadChatSummary(?\App\Models\User $user): array
    {
        if (! $user || ! \Illuminate\Support\Facades\Schema::hasTable('course_messages')) {
            return [
                'total_unread' => 0,
                'by_course' => [],
                'latest_items' => [],
            ];
        }

        if ($user->isLearner()) {
            $enrollments = \App\Models\Enrollment::where('user_id', $user->id)
                ->get(['course_id', 'created_at', 'enrolled_at']);

            if ($enrollments->isEmpty()) {
                return [
                    'total_unread' => 0,
                    'by_course' => [],
                    'latest_items' => [],
                ];
            }

            $query = \App\Models\CourseMessage::query()
                ->whereNull('read_at')
                ->where('sender_id', '!=', $user->id)
                ->where(function ($root) use ($enrollments, $user) {
                    foreach ($enrollments as $enrollment) {
                        $enrolledAt = $enrollment->created_at ?? $enrollment->enrolled_at;
                        $root->orWhere(function ($courseQuery) use ($enrollment, $enrolledAt, $user) {
                            $courseQuery->where('course_id', $enrollment->course_id)
                                ->where(function ($sub) use ($enrolledAt, $user) {
                                    $sub->where(function ($grp) use ($enrolledAt) {
                                        $grp->whereNull('recipient_id');
                                        if ($enrolledAt) {
                                            $grp->where('course_messages.created_at', '>=', $enrolledAt);
                                        }
                                    })
                                    ->orWhere('recipient_id', $user->id);
                                });
                        });
                    }
                });
        } else {
            $courseQuery = \App\Models\Course::query();
            if (! $user->isCoordinator() && ! $user->isPlatformStaff()) {
                $courseQuery->where(function ($q) use ($user) {
                    $q->where('instructor_id', $user->id);
                    if ($user->organization_id) {
                        $q->orWhere('organization_id', $user->organization_id);
                    }
                });
            }
            $courseIds = $courseQuery->pluck('id');

            if ($courseIds->isEmpty()) {
                return [
                    'total_unread' => 0,
                    'by_course' => [],
                    'latest_items' => [],
                ];
            }

            $query = \App\Models\CourseMessage::query()
                ->whereIn('course_id', $courseIds)
                ->whereNull('read_at')
                ->where('sender_id', '!=', $user->id)
                ->where(function ($q) use ($user) {
                    $q->whereNull('recipient_id')
                        ->orWhere('recipient_id', $user->id);
                });
        }

        $unreadMessages = $query->with(['course:id,title', 'sender:id,name,role'])
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        $byCourse = [];
        foreach ($unreadMessages as $msg) {
            $cId = (int) $msg->course_id;
            $byCourse[$cId] = ($byCourse[$cId] ?? 0) + 1;
        }

        $latestItems = $unreadMessages->take(8)->map(function ($msg) {
            return [
                'id' => $msg->id,
                'course_id' => $msg->course_id,
                'course_title' => $msg->course?->title ?? 'Course',
                'sender_name' => $msg->sender?->name ?? 'User',
                'sender_role' => $msg->sender?->role ?? '',
                'body' => $msg->body,
                'created_at' => $msg->created_at?->toISOString(),
            ];
        })->values()->all();

        return [
            'total_unread' => $unreadMessages->count(),
            'by_course' => $byCourse,
            'latest_items' => $latestItems,
        ];
    }
}
