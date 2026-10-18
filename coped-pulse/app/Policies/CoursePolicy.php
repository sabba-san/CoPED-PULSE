<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isStaff();
    }

    public function view(User $user, Course $course): bool
    {
        if (! $user->isStaff()) {
            return false;
        }

        // Platform staff see everything.
        if ($user->isPlatformStaff()) {
            return true;
        }

        // Partner instructors: own courses inside their own organization.
        return $course->instructor_id === $user->id
            && $course->organization_id === $user->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->isStaff();
    }

    public function update(User $user, Course $course): bool
    {
        if (! $user->isStaff()) {
            return false;
        }

        return $course->instructor_id === $user->id
            && $course->organization_id === $user->organization_id;
    }

    public function delete(User $user, Course $course): bool
    {
        if (! $user->isStaff()) {
            return false;
        }

        return $course->instructor_id === $user->id
            && $course->organization_id === $user->organization_id;
    }

    public function restore(User $user, Course $course): bool
    {
        return $this->update($user, $course);
    }

    public function forceDelete(User $user, Course $course): bool
    {
        return $this->delete($user, $course);
    }
}