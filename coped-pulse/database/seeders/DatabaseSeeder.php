<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create staff user
        $staff = User::factory()->create([
            'name' => 'Staff Instructor',
            'email' => 'instructor@coped.org',
            'role' => User::ROLE_STAFF,
            'password' => bcrypt('password'),
        ]);

        // Create learner user
        $learner = User::factory()->create([
            'name' => 'Test Learner',
            'email' => 'learner@coped.org',
            'role' => User::ROLE_LEARNER,
            'password' => bcrypt('password'),
        ]);

        // Create additional test user
        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role' => User::ROLE_LEARNER,
            'password' => bcrypt('password'),
        ]);

        $this->call([
            CourseSeeder::class,
            EnrollmentSeeder::class,
        ]);
    }
}