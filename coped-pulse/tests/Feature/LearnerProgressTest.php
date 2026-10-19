<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Module;
use App\Models\ModuleCompletion;
use App\Models\LessonCompletion;
use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LearnerProgressTest extends TestCase
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

    private function enrolledCourse(User $learner, int $moduleCount = 2, int $lessonsPerModule = 2): array
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $modules = collect();
        foreach (range(1, $moduleCount) as $mIndex) {
            $module = $course->modules()->create([
                'title' => "Module {$mIndex}",
                'order' => $mIndex,
            ]);

            foreach (range(1, $lessonsPerModule) as $lIndex) {
                $module->lessons()->create([
                    'title' => "Lesson {$mIndex}.{$lIndex}",
                    'content_type' => 'link',
                    'order' => $lIndex,
                ]);
            }

            $modules->push($module);
        }

        $enrollment = Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 0,
        ]);

        return [$course, $modules, $enrollment];
    }

    public function test_learner_can_complete_module_and_it_cascades_to_lessons(): void
    {
        $learner = $this->learner();
        [$course, $modules, $enrollment] = $this->enrolledCourse($learner, 1, 2);
        $module = $modules->first();

        $response = $this->actingAs($learner)->post(route('learner.course.module.complete', [$course, $module]));

        $response->assertRedirect();
        $this->assertDatabaseHas('module_completions', [
            'user_id' => $learner->id,
            'module_id' => $module->id,
            'course_id' => $course->id,
        ]);

        // Cascades to lessons
        foreach ($module->lessons as $lesson) {
            $this->assertDatabaseHas('lesson_completions', [
                'user_id' => $learner->id,
                'lesson_id' => $lesson->id,
            ]);
        }
    }

    public function test_learner_can_uncomplete_module(): void
    {
        $learner = $this->learner();
        [$course, $modules] = $this->enrolledCourse($learner, 1, 1);
        $module = $modules->first();

        // Complete first
        $this->actingAs($learner)->post(route('learner.course.module.complete', [$course, $module]));

        // Now uncomplete
        $response = $this->actingAs($learner)->delete(route('learner.course.module.uncomplete', [$course, $module]));

        $response->assertRedirect();
        $this->assertDatabaseMissing('module_completions', [
            'user_id' => $learner->id,
            'module_id' => $module->id,
        ]);
    }

    public function test_completing_all_lessons_cascades_up_to_parent_module(): void
    {
        $learner = $this->learner();
        [$course, $modules] = $this->enrolledCourse($learner, 1, 2);
        $module = $modules->first();
        $lessons = $module->lessons;

        // Complete first lesson
        $this->actingAs($learner)->post(route('learner.course.module.lesson.complete', [$course, $module, $lessons[0]]));
        $this->assertDatabaseMissing('module_completions', ['module_id' => $module->id]);

        // Complete second (and final) lesson
        $this->actingAs($learner)->post(route('learner.course.module.lesson.complete', [$course, $module, $lessons[1]]));
        $this->assertDatabaseHas('module_completions', [
            'user_id' => $learner->id,
            'module_id' => $module->id,
        ]);
    }

    public function test_learner_cannot_complete_module_without_enrollment(): void
    {
        $learner = $this->learner();
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create(['title' => 'Mod', 'order' => 1]);

        $response = $this->actingAs($learner)->post(route('learner.course.module.complete', [$course, $module]));

        $response->assertNotFound();
        $this->assertDatabaseMissing('module_completions', ['module_id' => $module->id]);
    }

    public function test_learner_can_save_and_delete_study_notes(): void
    {
        $learner = $this->learner();
        [$course, $modules] = $this->enrolledCourse($learner, 1, 1);
        $module = $modules->first();

        // Save note
        $response = $this->actingAs($learner)->post(route('learner.course.module.note.store', [$course, $module]), [
            'content' => 'Remember to review the 3 pillars of cybersecurity before the exam.',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('notes', [
            'user_id' => $learner->id,
            'module_id' => $module->id,
            'content' => 'Remember to review the 3 pillars of cybersecurity before the exam.',
        ]);

        // Delete note
        $delResponse = $this->actingAs($learner)->delete(route('learner.course.module.note.destroy', [$course, $module]));
        $delResponse->assertRedirect();
        $this->assertDatabaseMissing('notes', [
            'user_id' => $learner->id,
            'module_id' => $module->id,
        ]);
    }

    public function test_learner_can_update_daily_goal(): void
    {
        $learner = $this->learner();

        $response = $this->actingAs($learner)->put(route('learner.goal.update'), [
            'daily_goal_items' => 5,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('users', [
            'id' => $learner->id,
            'daily_goal_items' => 5,
        ]);
    }

    public function test_daily_goal_validates_range(): void
    {
        $learner = $this->learner();

        $response = $this->actingAs($learner)->put(route('learner.goal.update'), [
            'daily_goal_items' => 999,
        ]);

        $response->assertSessionHasErrors(['daily_goal_items']);
    }
}
