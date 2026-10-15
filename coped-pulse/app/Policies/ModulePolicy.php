<?php

namespace App\Policies;

use App\Models\Module;
use App\Models\User;

class ModulePolicy
{
    /**
     * Ownership is inherited from the parent course.
     * Only the instructor who created the course may manage its modules.
     */
    public function view(User $user, Module $module): bool
    {
        return $user->can('view', $module->course);
    }

    public function update(User $user, Module $module): bool
    {
        return $user->can('update', $module->course);
    }

    public function delete(User $user, Module $module): bool
    {
        return $user->can('delete', $module->course);
    }
}
