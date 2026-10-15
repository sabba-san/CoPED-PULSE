<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Staff Account
        User::firstOrCreate(
            ['email' => 'instruct@gmail.com'],
            [
                'name' => 'Irdina Athielia',
                'password' => Hash::make('password'),
                'role' => 'staff',
            ]
        );

        // Create Learner Account
        User::firstOrCreate(
            ['email' => 'learn@gmail.com'],
            [
                'name' => 'Learner A',
                'password' => Hash::make('password'),
                'role' => 'learner',
            ]
        );

        // Call your course seeder next
        $this->call([
            CourseSeeder::class,
        ]);
    }
}