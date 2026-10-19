<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $defaultPassword = Hash::make('password');

        // Staff / Instructor Accounts
        User::firstOrCreate(
            ['email' => 'instruct@gmail.com'],
            [
                'name' => 'Irdina Athielia',
                'password' => $defaultPassword,
                'role' => User::ROLE_STAFF,
            ]
        );

        User::firstOrCreate(
            ['email' => 'instructor@coped.org'],
            [
                'name' => 'Staff Instructor',
                'password' => $defaultPassword,
                'role' => User::ROLE_STAFF,
            ]
        );

        User::firstOrCreate(
            ['email' => 'rusdi@gmail.com'],
            [
                'name' => 'Rusdi Ismail',
                'password' => $defaultPassword,
                'role' => User::ROLE_STAFF,
            ]
        );

        // Learner Accounts
        User::firstOrCreate(
            ['email' => 'learn@gmail.com'],
            [
                'name' => 'Learner A',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
            ]
        );

        User::firstOrCreate(
            ['email' => 'abbasabudzarr@gmail.com'],
            [
                'name' => 'Abbas Abu Dzarr',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
            ]
        );

        User::firstOrCreate(
            ['email' => 'ameer@gmail.com'],
            [
                'name' => 'ameer zafran',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
            ]
        );

        User::firstOrCreate(
            ['email' => 'arman@gmail.com'],
            [
                'name' => 'arman fansuri',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
            ]
        );

        User::firstOrCreate(
            ['email' => 'learner@coped.org'],
            [
                'name' => 'Test Learner',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
            ]
        );

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
            ]
        );

        // Call course and enrollment seeders
        $this->call([
            CourseSeeder::class,
            EnrollmentSeeder::class,
        ]);
    }
}