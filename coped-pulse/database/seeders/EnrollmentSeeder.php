<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Seeder;

class EnrollmentSeeder extends Seeder
{
    public function run(): void
    {
        $learner = User::where('role', User::ROLE_LEARNER)->first();

        if (! $learner) {
            $learner = User::factory()->create([
                'name' => 'Test Learner',
                'email' => 'learner@coped.org',
                'role' => User::ROLE_LEARNER,
                'password' => bcrypt('password'),
            ]);
        }

        $publishedCourses = Course::where('status', 'published')->get();

        foreach ($publishedCourses as $index => $course) {
            if ($index === 0) {
                Enrollment::factory()->forUser($learner)->forCourse($course)->inProgress()->create();
            } elseif ($index === 1) {
                Enrollment::factory()->forUser($learner)->forCourse($course)->completed()->create();
            } elseif ($index === 2) {
                Enrollment::factory()->forUser($learner)->forCourse($course)->notStarted()->create();
            }
        }
    }
}