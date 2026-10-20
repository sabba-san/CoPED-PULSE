<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class StaffLessonTest extends TestCase
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

    public function test_staff_can_store_lesson_in_module(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create(['title' => 'Unit 1', 'order' => 1]);

        $response = $this->actingAs($staff)->post(route('staff.courses.modules.lessons.store', [$course, $module]), [
            'title' => 'Subtopic 1: Password Safety',
            'content' => 'Overview of multi-factor authentication.',
            'content_type' => 'link',
            'content_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('lessons', [
            'module_id' => $module->id,
            'title' => 'Subtopic 1: Password Safety',
            'content_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'order' => 1,
        ]);
    }

    public function test_store_lesson_validates_required_fields(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create(['title' => 'Unit 1', 'order' => 1]);

        $response = $this->actingAs($staff)->post(route('staff.courses.modules.lessons.store', [$course, $module]), [
            'title' => '',
            'content_type' => 'invalid-type',
        ]);

        $response->assertSessionHasErrors(['title', 'content_type']);
        $this->assertDatabaseCount('lessons', 0);
    }

    public function test_staff_can_update_lesson(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create(['title' => 'Unit 1', 'order' => 1]);
        $lesson = $module->lessons()->create([
            'title' => 'Original Lesson',
            'content_type' => 'link',
            'order' => 1,
        ]);

        $response = $this->actingAs($staff)->put(route('staff.courses.modules.lessons.update', [$course, $module, $lesson]), [
            'title' => 'Updated Lesson Title',
            'content_type' => 'link',
            'content_url' => 'https://youtu.be/dQw4w9WgXcQ',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('lessons', [
            'id' => $lesson->id,
            'title' => 'Updated Lesson Title',
            'content_url' => 'https://youtu.be/dQw4w9WgXcQ',
        ]);
    }

    public function test_staff_can_destroy_lesson(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create(['title' => 'Unit 1', 'order' => 1]);
        $lesson = $module->lessons()->create([
            'title' => 'Lesson to Delete',
            'content_type' => 'link',
            'order' => 1,
        ]);

        $response = $this->actingAs($staff)->delete(route('staff.courses.modules.lessons.destroy', [$course, $module, $lesson]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('lessons', ['id' => $lesson->id]);
    }

    public function test_cannot_add_lesson_to_module_from_another_course(): void
    {
        $staff = $this->staff();
        $courseA = Course::factory()->published()->forInstructor($staff)->create();
        $courseB = Course::factory()->published()->forInstructor($staff)->create();
        $moduleB = $courseB->modules()->create(['title' => 'Module in Course B', 'order' => 1]);

        // Attempting to post to Course A with Module B
        $response = $this->actingAs($staff)->post(route('staff.courses.modules.lessons.store', [$courseA, $moduleB]), [
            'title' => 'Illegal Lesson',
            'content_type' => 'link',
        ]);

        $response->assertNotFound();
        $this->assertDatabaseMissing('lessons', ['title' => 'Illegal Lesson']);
    }

    public function test_other_staff_cannot_manage_foreign_course_lesson(): void
    {
        $owner = $this->staff();
        $intruder = $this->staff();

        $course = Course::factory()->published()->forInstructor($owner)->create();
        $module = $course->modules()->create(['title' => 'Owner Module', 'order' => 1]);
        $lesson = $module->lessons()->create(['title' => 'Owner Lesson', 'content_type' => 'link', 'order' => 1]);

        $response = $this->actingAs($intruder)->put(route('staff.courses.modules.lessons.update', [$course, $module, $lesson]), [
            'title' => 'Hijacked',
            'content_type' => 'link',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('lessons', ['title' => 'Hijacked']);
    }

    public function test_learner_cannot_manage_lessons(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();

        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create(['title' => 'Module', 'order' => 1]);

        $response = $this->actingAs($learner)->post(route('staff.courses.modules.lessons.store', [$course, $module]), [
            'title' => 'Learner Lesson',
            'content_type' => 'link',
        ]);

        $this->assertTrue(in_array($response->getStatusCode(), [302, 403]));
        $this->assertDatabaseMissing('lessons', ['title' => 'Learner Lesson']);
    }

    public function test_staff_can_view_module_edit_with_action_cards_and_assessments(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create(['title' => 'Unit 1: Foundations', 'order' => 1]);

        // Module mini-quiz
        Assessment::create([
            'course_id' => $course->id,
            'module_id' => $module->id,
            'question' => 'Module question 1',
            'option_a' => 'A',
            'option_b' => 'B',
            'option_c' => 'C',
            'option_d' => 'D',
            'correct_option' => 'a',
        ]);

        // Course final exam question
        Assessment::create([
            'course_id' => $course->id,
            'module_id' => null,
            'question' => 'Course final exam question 1',
            'option_a' => 'A',
            'option_b' => 'B',
            'option_c' => 'C',
            'option_d' => 'D',
            'correct_option' => 'b',
        ]);

        $response = $this->actingAs($staff)->get(route('staff.courses.modules.edit', [$course, $module]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('design_v1/Staff/Modules/Edit')
            ->has('course')
            ->where('course.id', $course->id)
            ->has('module')
            ->where('module.id', $module->id)
            ->has('assessments', 1)
            ->has('finalAssessments', 1)
        );
    }
}
