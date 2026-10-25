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

        // Subject Coordinator Account
        $coordinator = User::firstOrCreate(
            ['email' => 'coordinator@coped.org'],
            [
                'name' => 'Dr. Penyelaras Subjek',
                'password' => $defaultPassword,
                'role' => User::ROLE_COORDINATOR,
                'phone' => '+60120000001',
            ]
        );
        $coordinator->update(['phone' => $coordinator->phone ?? '+60120000001']);

        // Staff / Instructor Accounts
        $irdina = User::firstOrCreate(
            ['email' => 'instruct@gmail.com'],
            [
                'name' => 'Irdina Athielia',
                'password' => $defaultPassword,
                'role' => User::ROLE_STAFF,
                'phone' => '+60123456789',
            ]
        );
        $irdina->update(['phone' => $irdina->phone ?? '+60123456789']);

        $staff = User::firstOrCreate(
            ['email' => 'instructor@coped.org'],
            [
                'name' => 'Staff Instructor',
                'password' => $defaultPassword,
                'role' => User::ROLE_STAFF,
                'phone' => '+60123456780',
            ]
        );
        $staff->update(['phone' => $staff->phone ?? '+60123456780']);

        $rusdi = User::firstOrCreate(
            ['email' => 'rusdi@gmail.com'],
            [
                'name' => 'Rusdi Ismail',
                'password' => $defaultPassword,
                'role' => User::ROLE_STAFF,
                'phone' => '+60198765432',
            ]
        );
        $rusdi->update(['phone' => $rusdi->phone ?? '+60198765432']);

        // Learner Accounts
        $learnerA = User::firstOrCreate(
            ['email' => 'learn@gmail.com'],
            [
                'name' => 'Learner A',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
                'phone' => '+60111234567',
            ]
        );
        $learnerA->update(['phone' => $learnerA->phone ?? '+60111234567']);

        $abbas = User::firstOrCreate(
            ['email' => 'abbasabudzarr@gmail.com'],
            [
                'name' => 'Abbas Abu Dzarr',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
                'phone' => '+60112345678',
            ]
        );
        $abbas->update(['phone' => $abbas->phone ?? '+60112345678']);

        $ameer = User::firstOrCreate(
            ['email' => 'ameer@gmail.com'],
            [
                'name' => 'ameer zafran',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
                'phone' => '+60113456789',
            ]
        );
        $ameer->update(['phone' => $ameer->phone ?? '+60113456789']);

        $arman = User::firstOrCreate(
            ['email' => 'arman@gmail.com'],
            [
                'name' => 'arman fansuri',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
                'phone' => '+60114567890',
            ]
        );
        $arman->update(['phone' => $arman->phone ?? '+60114567890']);

        $testLearner = User::firstOrCreate(
            ['email' => 'learner@coped.org'],
            [
                'name' => 'Test Learner',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
                'phone' => '+60115678901',
            ]
        );
        $testLearner->update(['phone' => $testLearner->phone ?? '+60115678901']);

        $testUser = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => $defaultPassword,
                'role' => User::ROLE_LEARNER,
                'phone' => '+60116789012',
            ]
        );
        $testUser->update(['phone' => $testUser->phone ?? '+60116789012']);

        // Call course and enrollment seeders
        $this->call([
            CourseSeeder::class,
            EnrollmentSeeder::class,
        ]);
    }
}