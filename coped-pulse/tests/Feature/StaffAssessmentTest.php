<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffAssessmentTest extends TestCase
{
    use RefreshDatabase;

    private function staff(): User
    {
        return User::factory()->create(['role' => 'staff']);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'question' => 'What is the first step in safeguarding?',
            'option_a' => 'Ignore',
            'option_b' => 'Document and refer',
            'option_c' => 'Confront',
            'option_d' => 'Wait',
            'correct_option' => 'b',
        ], $overrides);
    }

    public function test_owner_can_store_quiz_question(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $this->actingAs($staff)
            ->post(route('staff.courses.assessments.store', $course), $this->payload())
            ->assertRedirect();

        $this->assertDatabaseHas('assessments', [
            'course_id' => $course->id,
            'question' => 'What is the first step in safeguarding?',
            'correct_option' => 'b',
        ]);
    }

    public function test_store_validates_quiz_fields(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $this->actingAs($staff)
            ->post(route('staff.courses.assessments.store', $course), $this->payload(['correct_option' => 'z']))
            ->assertSessionHasErrors('correct_option');

        $this->assertDatabaseCount('assessments', 0);
    }

    public function test_owner_can_delete_quiz_question(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $assessment = Assessment::create(array_merge(['course_id' => $course->id], $this->payload()));

        $this->actingAs($staff)
            ->delete(route('staff.courses.assessments.destroy', [$course, $assessment]))
            ->assertRedirect();

        $this->assertDatabaseMissing('assessments', ['id' => $assessment->id]);
    }

    public function test_cannot_delete_quiz_from_another_course(): void
    {
        $staff = $this->staff();
        $courseA = Course::factory()->published()->forInstructor($staff)->create();
        $courseB = Course::factory()->published()->forInstructor($staff)->create();
        $assessmentB = Assessment::create(array_merge(['course_id' => $courseB->id], $this->payload()));

        $this->actingAs($staff)
            ->delete(route('staff.courses.assessments.destroy', [$courseA, $assessmentB]))
            ->assertNotFound();

        $this->assertDatabaseHas('assessments', ['id' => $assessmentB->id]);
    }

    public function test_intruder_staff_cannot_manage_quiz(): void
    {
        $owner = $this->staff();
        $intruder = $this->staff();
        $course = Course::factory()->published()->forInstructor($owner)->create();

        $this->actingAs($intruder)
            ->post(route('staff.courses.assessments.store', $course), $this->payload())
            ->assertForbidden();
    }

    public function test_learner_cannot_manage_quiz(): void
    {
        $staff = $this->staff();
        $learner = User::factory()->create(['role' => 'learner']);
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $this->actingAs($learner)
            ->post(route('staff.courses.assessments.store', $course), $this->payload())
            ->assertForbidden();
    }

    public function test_edit_page_includes_assessments(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        Assessment::create(array_merge(['course_id' => $course->id], $this->payload()));

        $this->actingAs($staff)
            ->get(route('staff.courses.edit', $course))
            ->assertOk();
    }
}
