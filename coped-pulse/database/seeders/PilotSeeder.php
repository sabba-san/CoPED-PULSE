<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Ready-to-use KSSM pilot classroom accounts. Must run after CourseSeeder.
 */
class PilotSeeder extends Seeder
{
    public function run(): void
    {
        $classes = [
            'f1' => ['title' => CourseSeeder::KSSM_F1_TITLE, 'label' => 'Tingkatan 1'],
            'f4' => ['title' => CourseSeeder::KSSM_F4_TITLE, 'label' => 'Tingkatan 4'],
            // Form 4 pupils take Additional Mathematics too, so they are enrolled here as well.
            'addmath' => ['title' => CourseSeeder::KSSM_ADD_TITLE, 'label' => 'Matematik Tambahan Tingkatan 4', 'also' => ['f4']],
        ];

        foreach ($classes as $code => $class) {
            $course = Course::where('title', $class['title'])->first();
            if (! $course) {
                $this->command?->warn("PilotSeeder: course '{$class['title']}' not found. Run CourseSeeder first.");
                continue;
            }

            $teacher = $this->account("cikgu_{$code}@coped.uum.edu.my", "Cikgu Matematik {$class['label']}", User::ROLE_STAFF);
            $course->update(['instructor_id' => $teacher->id]);

            foreach ([$code, ...($class['also'] ?? [])] as $learnerCode) {
                foreach (range(1, 5) as $n) {
                    $num = str_pad((string) $n, 2, '0', STR_PAD_LEFT);
                    $learner = $this->account("{$learnerCode}_murid{$num}@coped.uum.edu.my", "Murid {$learnerCode} {$num}", User::ROLE_LEARNER);

                    Enrollment::firstOrCreate(
                        ['user_id' => $learner->id, 'course_id' => $course->id],
                        ['progress' => 0.00, 'enrolled_at' => now()]
                    );
                }
            }
        }
    }

    private function account(string $email, string $name, string $role): User
    {
        return User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make('password'), 'role' => $role]
        );
    }
}

