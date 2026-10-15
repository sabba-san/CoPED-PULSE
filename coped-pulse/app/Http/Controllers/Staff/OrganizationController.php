<?php

namespace App\Http\Controllers\Staff;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class OrganizationController extends Controller
{
    /**
     * Partner profile: own organization, its courses, its team.
     * Platform staff (no organization) get an empty state.
     */
    public function show(): Response
    {
        $org = Schema::hasTable('organizations') ? auth()->user()->organization : null;

        $courses = $org
            ? $org->courses()
                ->select('id', 'title', 'status', 'organization_id')
                ->withCount(['modules', 'enrollments'])
                ->latest()
                ->take(10)
                ->get()
            : [];

        $members = $org
            ? $org->users()
                ->select('id', 'name', 'email', 'role')
                ->orderBy('name')
                ->get()
            : [];

        return Inertia::render('design_v1/Staff/Organization/Show', [
            'organization' => $org,
            'courses' => $courses,
            'members' => $members,
        ]);
    }
}
