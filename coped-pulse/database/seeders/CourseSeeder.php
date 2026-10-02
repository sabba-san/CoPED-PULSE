<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $staff = User::where('role', User::ROLE_STAFF)->first();

        if (! $staff) {
            $staff = User::factory()->create([
                'name' => 'Staff Instructor',
                'email' => 'instructor@coped.org',
                'role' => User::ROLE_STAFF,
                'password' => bcrypt('password'),
            ]);
        }

        Course::factory()->count(5)->published()->forInstructor($staff)->create([
            'title' => 'Child Protection Fundamentals',
            'description' => 'Core principles and legal frameworks for child protection in humanitarian settings. Covers UNCRC, mandatory reporting, and referral pathways.',
        ]);

        Course::factory()->count(3)->published()->forInstructor($staff)->create([
            'title' => 'Psychosocial Support for Children',
            'description' => 'Evidence-based approaches to providing psychosocial support to children affected by crisis. Includes PFA, safe spaces, and caregiver engagement.',
        ]);

        Course::factory()->count(2)->published()->forInstructor($staff)->create([
            'title' => 'Case Management in Child Protection',
            'description' => 'Step-by-step case management methodology: identification, assessment, planning, implementation, monitoring, and closure. Best practices for documentation.',
        ]);

        Course::factory()->count(2)->draft()->forInstructor($staff)->create([
            'title' => 'Child Safeguarding Policy Development',
            'description' => 'How to develop and implement organizational child safeguarding policies. Risk assessment, code of conduct, and reporting mechanisms.',
        ]);

        Course::factory()->count(1)->archived()->forInstructor($staff)->create([
            'title' => 'Legacy Course: Basic Hygiene Promotion',
            'description' => 'Archived content. Superseded by WASH Integration module.',
        ]);
    }
}