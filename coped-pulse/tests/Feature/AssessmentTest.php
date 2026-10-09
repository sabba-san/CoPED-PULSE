<?php

namespace Tests\Feature;

use App\Models\Assessment;
use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AssessmentTest extends TestCase
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

    private function publishedCourseWithQuiz(User $staff, int $count = 2): Course
    {
        $course = Course::factory()->published()->forInstructor($staff)->create();

        foreach (range(1, $count) as $i) {
            Assessment::create([
                'course_id' => $course->id,
                'question' => "Question {$i}?",
                'option_a' => 'Alpha',
                'option_b' => 'Beta',
                'option_c' => 'Gamma',
                'option_d' => 'Delta',
                'correct_option' => 'b',
            ]);
        }

        return $course;
    }

    private function answersFor(Course $course, string $option = 'b'): array
    {
        return $course->assessments->mapWithKeys(fn ($a) => [$a->id => $option])->all();
    }

    public function test_assess_requires_enrollment(): void
    {
        $course = $this->publishedCourseWithQuiz($this->staff());
        $learner = $this->learner();

        $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), [
                'answers' => $this->answersFor($course),
            ])
            ->assertNotFound();
    }

    public function test_assess_rejects_unpublished_course(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->draft()->forInstructor($staff)->create();
        Assessment::create([
            'course_id' => $course->id,
            'question' => 'Q?',
            'option_a' => 'A',
            'option_b' => 'B',
            'option_c' => 'C',
            'option_d' => 'D',
            'correct_option' => 'a',
        ]);
        $learner->enrollments()->create(['course_id' => $course->id]);

        $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), [
                'answers' => $this->answersFor($course->fresh(), 'a'),
            ])
            ->assertNotFound();
    }

    public function test_assess_validates_answers(): void
    {
        $course = $this->publishedCourseWithQuiz($this->staff());
        $learner = $this->learner();
        $learner->enrollments()->create(['course_id' => $course->id]);

        // Missing answers payload.
        $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), [])
            ->assertSessionHasErrors('answers');

        // Invalid option value.
        $bad = $this->answersFor($course);
        $bad[array_key_first($bad)] = 'e';

        $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), ['answers' => $bad])
            ->assertSessionHasErrors();
    }

    public function test_assess_with_no_questions_returns_error(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $enrollment = $learner->enrollments()->create(['course_id' => $course->id]);

        $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), ['answers' => ['1' => 'a']])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertNull($enrollment->fresh()->completed_at);
    }

    public function test_full_score_completes_course(): void
    {
        $course = $this->publishedCourseWithQuiz($this->staff());
        $learner = $this->learner();
        $enrollment = $learner->enrollments()->create(['course_id' => $course->id]);

        $response = $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), [
                'answers' => $this->answersFor($course, 'b'),
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('assessment_passed', true);

        $fresh = $enrollment->fresh();
        $this->assertEquals(100.00, (float) $fresh->progress);
        $this->assertNotNull($fresh->completed_at);
    }

    public function test_partial_score_updates_progress_without_completion(): void
    {
        $course = $this->publishedCourseWithQuiz($this->staff(), 2);
        $learner = $this->learner();
        $enrollment = $learner->enrollments()->create(['course_id' => $course->id]);

        $answers = $course->assessments->pluck('id')->all();
        $payload = [$answers[0] => 'b', $answers[1] => 'a']; // 1/2 correct

        $response = $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), ['answers' => $payload]);

        $response->assertRedirect();
        $response->assertSessionHas('assessment_passed', false);

        $fresh = $enrollment->fresh();
        $this->assertEquals(50.00, (float) $fresh->progress);
        $this->assertNull($fresh->completed_at);
    }

    public function test_assess_accepts_uppercase_options(): void
    {
        $course = $this->publishedCourseWithQuiz($this->staff(), 1);
        $learner = $this->learner();
        $enrollment = $learner->enrollments()->create(['course_id' => $course->id]);

        $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), [
                'answers' => $this->answersFor($course, 'B'),
            ])
            ->assertRedirect()
            ->assertSessionHas('assessment_passed', true);

        $this->assertNotNull($enrollment->fresh()->completed_at);
    }

    public function test_assess_returns_json_when_requested(): void
    {
        $course = $this->publishedCourseWithQuiz($this->staff(), 2);
        $learner = $this->learner();
        $learner->enrollments()->create(['course_id' => $course->id]);

        $response = $this->actingAs($learner)
            ->postJson(route('learner.course.assess', $course), [
                'answers' => $this->answersFor($course, 'b'),
            ]);

        $response->assertOk()
            ->assertJson(['passed' => true, 'correct' => 2, 'total' => 2, 'score' => 100]);
    }

    public function test_learn_page_loads_with_assessments(): void
    {
        $course = $this->publishedCourseWithQuiz($this->staff(), 1);
        $learner = $this->learner();
        $learner->enrollments()->create(['course_id' => $course->id]);

        $this->actingAs($learner)
            ->get(route('learner.course.learn', $course))
            ->assertOk();
    }
}
