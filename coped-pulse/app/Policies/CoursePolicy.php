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
        return $user->isStaff() && $course->instructor_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isStaff();
    }

    public function update(User $user, Course $course): bool
    {
        return $user->isStaff() && $course->instructor_id === $user->id;
    }

    public function delete(User $user, Course $course): bool
    {
        return $user->isStaff() && $course->instructor_id === $user->id;
    }

    public function restore(User $user, Course $course): bool
    {
        return $user->isStaff() && $course->instructor_id === $user->id;
    }

    public function forceDelete(User $user, Course $course): bool
    {
        return $user->isStaff() && $course->instructor_id === $user->id;
    }
}