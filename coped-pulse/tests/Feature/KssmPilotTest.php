<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Database\Seeders\CourseSeeder;
use Database\Seeders\PilotSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class KssmPilotTest extends TestCase
{
    use RefreshDatabase;

    public function test_kssm_pilot_courses_teachers_and_learners_are_seeded_idempotently(): void
    {
        foreach ([1, 2] as $_) {
            $this->seed(CourseSeeder::class);
            $this->seed(PilotSeeder::class);
        }

        // [title, bundle PDF, chapter count, enrollments]
        $expected = [
            'f1' => [CourseSeeder::KSSM_F1_TITLE, '/books/matematik-tingkatan-1.pdf', 13, 5],
            'f4' => [CourseSeeder::KSSM_F4_TITLE, '/books/matematik-tingkatan-4.pdf', 10, 5],
            'addmath' => [CourseSeeder::KSSM_ADD_TITLE, '/books/matematik-tambahan-tingkatan-4.pdf', 10, 10],
        ];

        foreach ($expected as $code => [$title, $bundle, $chapters, $enrolled]) {
            $course = Course::where('title', $title)->with('modules.lessons')->firstOrFail();

            $this->assertSame('school', $course->course_mode);
            $this->assertSame('published', $course->status);
            $this->assertSame($bundle, $course->bundle_url);
            $this->assertSame($chapters, $course->modules->count());
            $this->assertSame(5, $course->assessments()->whereNull('module_id')->count());
            $this->assertGreaterThanOrEqual($chapters, $course->assessments()->whereNotNull('module_id')->count());

            foreach ($course->modules as $module) {
                // Real watch URLs only: YouTube search pages cannot be embedded in the player.
                $this->assertMatchesRegularExpression('~^https://www\.youtube\.com/watch\?v=[\w-]{11}$~', $module->media_url);
                $this->assertTrue($module->lessons->contains('content_url', $bundle), "{$module->title} should link its textbook PDF.");
            }

            $teacher = User::where('email', "cikgu_{$code}@coped.uum.edu.my")->firstOrFail();
            $this->assertSame(User::ROLE_STAFF, $teacher->role);
            $this->assertSame($teacher->id, $course->instructor_id);

            $this->assertSame($enrolled, $course->enrollments()->count());
        }

        foreach (['f1', 'f4', 'addmath'] as $code) {
            $this->assertSame(5, User::where('email', 'like', "{$code}_murid%@coped.uum.edu.my")->where('role', User::ROLE_LEARNER)->count());
        }
    }
}
