<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleCompletionTest extends TestCase
{
    use RefreshDatabase;

    private function staff(): User
    {
        return User::factory()->staff()->create();
    }

    private function learner(): User
    {
        return User::factory()->learner()->create();
    }

    private function createCourseWithModules(User $instructor, int $count = 2): Course
    {
        $course = Course::factory()->published()->forInstructor($instructor)->create();

        for ($i = 1; $i <= $count; $i++) {
            $course->modules()->create([
                'title' => "Module {$i}",
                'order' => $i,
                'content_type' => 'link',
                'media_url' => "https://example.com/video-{$i}",
            ]);
        }

        return $course;
    }

    public function test_learner_can_mark_module_complete_via_module_completion_controller(): void
    {
        $instructor = $this->staff();
        $learner = $this->learner();
        $course = $this->createCourseWithModules($instructor, 2);
        $module = $course->modules()->first();

        Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
        ]);

        $response = $this->actingAs($learner)->post(
            route('learner.course.module.complete', [$course, $module])
        );

        $response->assertRedirect();
        $response->assertSessionHas('success', fn ($msg) => str_contains($msg, 'Module completed: Module 1'));

        $this->assertDatabaseHas('module_user', [
            'user_id' => $learner->id,
            'module_id' => $module->id,
        ]);

        $this->assertTrue($learner->completedModules()->where('modules.id', $module->id)->exists());
    }

    public function test_module_completion_updates_enrollment_progress_percentage_accurately(): void
    {
        $instructor = $this->staff();
        $learner = $this->learner();
        $course = $this->createCourseWithModules($instructor, 2);
        $modules = $course->modules()->orderBy('order')->get();

        $enrollment = Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
        ]);

        // Complete 1st module (50% for 0-assessment course)
        $this->actingAs($learner)->post(
            route('learner.course.module.complete', [$course, $modules[0]])
        );

        $enrollment->refresh();
        $this->assertEquals(50.0, (float) $enrollment->progress);

        // Complete 2nd module (100% and completed_at set)
        $this->actingAs($learner)->post(
            route('learner.course.module.complete', [$course, $modules[1]])
        );

        $enrollment->refresh();
        $this->assertEquals(100.0, (float) $enrollment->progress);
        $this->assertNotNull($enrollment->completed_at);
    }

    public function test_module_completion_caps_at_80_percent_when_assessments_exist(): void
    {
        $instructor = $this->staff();
        $learner = $this->learner();
        $course = $this->createCourseWithModules($instructor, 2);
        // Add a final exam assessment
        $course->assessments()->create([
            'question' => 'Final Exam Question 1',
            'option_a' => 'Opt A',
            'option_b' => 'Opt B',
            'option_c' => 'Opt C',
            'option_d' => 'Opt D',
            'correct_option' => 'a',
        ]);

        $modules = $course->modules()->orderBy('order')->get();

        $enrollment = Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
        ]);

        // Complete 1st module (1/2 * 80% = 40%)
        $this->actingAs($learner)->post(
            route('learner.course.module.complete', [$course, $modules[0]])
        );
        $enrollment->refresh();
        $this->assertEquals(40.0, (float) $enrollment->progress);
        $this->assertNull($enrollment->completed_at);

        // Complete 2nd module (2/2 * 80% = 80%)
        $this->actingAs($learner)->post(
            route('learner.course.module.complete', [$course, $modules[1]])
        );
        $enrollment->refresh();
        $this->assertEquals(80.0, (float) $enrollment->progress);
        $this->assertNull($enrollment->completed_at); // remains null until assessment passed
    }

    public function test_unenrolled_learner_cannot_complete_module(): void
    {
        $instructor = $this->staff();
        $learner = $this->learner();
        $course = $this->createCourseWithModules($instructor, 2);
        $module = $course->modules()->first();

        // No enrollment created
        $response = $this->actingAs($learner)->post(
            route('learner.course.module.complete', [$course, $module])
        );

        $response->assertNotFound();
        $this->assertDatabaseMissing('module_user', [
            'user_id' => $learner->id,
            'module_id' => $module->id,
        ]);
    }

    public function test_learner_can_uncomplete_module_and_progress_recalculates(): void
    {
        $instructor = $this->staff();
        $learner = $this->learner();
        $course = $this->createCourseWithModules($instructor, 2);
        $module = $course->modules()->first();

        $enrollment = Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
        ]);

        // Complete
        $this->actingAs($learner)->post(
            route('learner.course.module.complete', [$course, $module])
        );
        $enrollment->refresh();
        $this->assertEquals(50.0, (float) $enrollment->progress);

        // Uncomplete
        $response = $this->actingAs($learner)->delete(
            route('learner.course.module.uncomplete', [$course, $module])
        );

        $response->assertRedirect();
        $this->assertDatabaseMissing('module_user', [
            'user_id' => $learner->id,
            'module_id' => $module->id,
        ]);

        $enrollment->refresh();
        $this->assertEquals(0.0, (float) $enrollment->progress);
    }

    public function test_instructor_dashboard_recent_activity_shows_freshly_completed_learner(): void
    {
        $instructor = $this->staff();
        $learner = $this->learner();
        $course = $this->createCourseWithModules($instructor, 2);
        $module = $course->modules()->first();

        $enrollment = Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
            'created_at' => now()->subHours(2),
            'updated_at' => now()->subHours(2),
        ]);

        // Learner completes a module -> touches updated_at to now()
        $this->actingAs($learner)->post(
            route('learner.course.module.complete', [$course, $module])
        );

        // Instructor visits dashboard
        $response = $this->actingAs($instructor)->get(route('dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('design_v1/Staff/Dashboard', false)
            ->has('recentActivity', 1)
            ->where('recentActivity.0.user.name', $learner->name)
            ->where('recentActivity.0.progress', fn ($val) => (float) $val == 50.0)
            ->where('recentActivity.0.completed_modules_count', 1)
            ->where('recentActivity.0.total_modules_count', 2)
            ->where('recentActivity.0.latest_module_title', $module->title)
            ->where('recentActivity.0.assessment_status', 'pending')
        );
    }
}
