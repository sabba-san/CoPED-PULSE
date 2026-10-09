<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EnrollmentGuardTest extends TestCase
{
    use RefreshDatabase;

    private function staff(): User
    {
        return User::factory()->create(['role' => 'staff']);
    }

    private function learner(): User
    {
        return User::factory()->create(['role' => 'learner']);
    }

    public function test_learner_cannot_enroll_in_draft_course(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->draft()->forInstructor($staff)->create();

        $response = $this->actingAs($learner)->post(route('learner.catalog.enroll', $course));

        $response->assertNotFound();
        $this->assertDatabaseMissing('enrollments', [
            'user_id' => $learner->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_learner_cannot_enroll_in_archived_course(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->archived()->forInstructor($staff)->create();

        $response = $this->actingAs($learner)->post(route('learner.catalog.enroll', $course));

        $response->assertNotFound();
        $this->assertDatabaseMissing('enrollments', [
            'user_id' => $learner->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_learner_can_enroll_in_published_course(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $response = $this->actingAs($learner)->post(route('learner.catalog.enroll', $course));

        $response->assertRedirect(route('portal'));
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $learner->id,
            'course_id' => $course->id,
        ]);
    }

    public function test_enroll_is_idempotent(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $this->actingAs($learner)->post(route('learner.catalog.enroll', $course));
        $this->actingAs($learner)->post(route('learner.catalog.enroll', $course));

        $this->assertEquals(1, $learner->enrollments()->where('course_id', $course->id)->count());
    }

    public function test_learner_cannot_learn_archived_course(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $learner->enrollments()->create(['course_id' => $course->id]);

        $course->update(['status' => 'archived']);

        $this->actingAs($learner)
            ->get(route('learner.course.learn', $course))
            ->assertNotFound();
    }

    public function test_learner_cannot_learn_draft_course(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->draft()->forInstructor($staff)->create();
        // Enrolled before unpublish (e.g. seeded directly).
        $learner->enrollments()->create(['course_id' => $course->id]);

        $this->actingAs($learner)
            ->get(route('learner.course.learn', $course))
            ->assertNotFound();
    }

    public function test_learner_can_learn_published_course_when_enrolled(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $learner->enrollments()->create(['course_id' => $course->id]);

        $this->actingAs($learner)
            ->get(route('learner.course.learn', $course))
            ->assertOk();
    }

    public function test_learner_cannot_learn_without_enrollment(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $this->actingAs($learner)
            ->get(route('learner.course.learn', $course))
            ->assertNotFound();
    }

    public function test_staff_cannot_update_module_from_another_course(): void
    {
        $staff = $this->staff();
        $courseA = Course::factory()->published()->forInstructor($staff)->create();
        $courseB = Course::factory()->published()->forInstructor($staff)->create();
        $moduleB = $courseB->modules()->create([
            'title' => 'B module',
            'order' => 1,
        ]);

        $response = $this->actingAs($staff)->put(route('staff.courses.modules.update', [$courseA, $moduleB]), [
            'title' => 'Hacked',
        ]);

        $response->assertNotFound();
        $this->assertDatabaseHas('modules', [
            'id' => $moduleB->id,
            'title' => 'B module',
        ]);
    }

    public function test_staff_cannot_destroy_module_from_another_course(): void
    {
        $staff = $this->staff();
        $courseA = Course::factory()->published()->forInstructor($staff)->create();
        $courseB = Course::factory()->published()->forInstructor($staff)->create();
        $moduleB = $courseB->modules()->create([
            'title' => 'B module',
            'order' => 1,
        ]);

        $response = $this->actingAs($staff)->delete(route('staff.courses.modules.destroy', [$courseA, $moduleB]));

        $response->assertNotFound();
        $this->assertDatabaseHas('modules', ['id' => $moduleB->id]);
    }

    public function test_staff_can_update_own_module(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create(['title' => 'Old', 'order' => 1]);

        $this->actingAs($staff)
            ->put(route('staff.courses.modules.update', [$course, $module]), [
                'title' => 'New',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('modules', ['id' => $module->id, 'title' => 'New']);
    }

    public function test_other_staff_cannot_touch_foreign_course_module(): void
    {
        $owner = $this->staff();
        $intruder = $this->staff();
        $course = Course::factory()->published()->forInstructor($owner)->create();
        $module = $course->modules()->create(['title' => 'Owned', 'order' => 1]);

        $this->actingAs($intruder)
            ->put(route('staff.courses.modules.update', [$course, $module]), ['title' => 'Hacked'])
            ->assertForbidden();
    }
}
