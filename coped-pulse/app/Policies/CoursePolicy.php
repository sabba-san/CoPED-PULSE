<?php

namespace App\Policies;

use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isStaffOrCoordinator();
    }

    public function view(User $user, Course $course): bool
    {
        if (! $user->isStaffOrCoordinator()) {
            return false;
        }

        // Platform staff and coordinators see everything.
        if ($user->isCoordinator() || $user->isPlatformStaff()) {
            return true;
        }

        // Partner instructors: own courses inside their own organization.
        return $course->instructor_id === $user->id
            && $course->organization_id === $user->organization_id;
    }

    public function create(User $user): bool
    {
        return $user->isStaffOrCoordinator();
    }

    public function update(User $user, Course $course): bool
    {
        if (! $user->isStaffOrCoordinator()) {
            return false;
        }

        if ($user->isCoordinator()) {
            return true;
        }

        return $course->instructor_id === $user->id
            && $course->organization_id === $user->organization_id;
    }

    public function delete(User $user, Course $course): bool
    {
        if (! $user->isStaffOrCoordinator()) {
            return false;
        }

        if ($user->isCoordinator()) {
            return true;
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