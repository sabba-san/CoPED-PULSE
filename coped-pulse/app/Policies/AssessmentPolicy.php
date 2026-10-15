<?php

namespace App\Policies;

use App\Models\Assessment;
use App\Models\User;

class AssessmentPolicy
{
    /**
     * Ownership is inherited from the parent course (course_id FK).
     * Module scoping (module_id belongs to course) is enforced
     * separately by Form Request validation + abort_if guards.
     */
    public function update(User $user, Assessment $assessment): bool
    {
        return $user->can('update', $assessment->course);
    }

    public function delete(User $user, Assessment $assessment): bool
    {
        return $user->can('delete', $assessment->course);
    }
}
