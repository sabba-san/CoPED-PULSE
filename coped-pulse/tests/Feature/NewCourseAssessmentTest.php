<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Database\Seeders\CourseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NewCourseAssessmentTest extends TestCase
{
    use RefreshDatabase;

    private function learner(): User
    {
        return User::factory()->learner()->create([
            'email' => 'genai_learner_' . uniqid() . '@example.com',
        ]);
    }

    public function test_seeded_genai_course_exists_with_video_links_and_articles(): void
    {
        $this->seed(CourseSeeder::class);

        $course = Course::where('title', 'Kecerdasan Buatan Generatif & Kejuruteraan Prompt untuk Profesional')
            ->with(['modules.lessons', 'modules.assessments'])
            ->first();

        $this->assertNotNull($course, 'GenAI flagship course should be seeded.');
        $this->assertSame('published', $course->status);
        $this->assertSame('ai', $course->category_logo);
        $this->assertSame(3, $course->modules->count(), 'Course should have 3 modules.');

        foreach ($course->modules as $module) {
            $this->assertNotEmpty($module->media_url, "Module {$module->title} must have a video/media URL.");
            $this->assertNotEmpty($module->transcript, "Module {$module->title} must have an overview article / transcript.");
            $this->assertGreaterThanOrEqual(2, $module->lessons->count(), "Module {$module->title} must have at least 2 subtopics.");

            foreach ($module->lessons as $lesson) {
                $this->assertNotEmpty($lesson->content_url, "Lesson {$lesson->title} must have a content/video URL.");
                $this->assertNotEmpty($lesson->content, "Lesson {$lesson->title} must have article content for students to read.");
            }
        }
    }

    public function test_genai_course_has_mini_quizzes_for_each_module(): void
    {
        $this->seed(CourseSeeder::class);

        $course = Course::where('title', 'Kecerdasan Buatan Generatif & Kejuruteraan Prompt untuk Profesional')
            ->with('modules')
            ->firstOrFail();

        foreach ($course->modules as $module) {
            $miniQuizzes = $course->assessments()->where('module_id', $module->id)->get();
            $this->assertGreaterThanOrEqual(2, $miniQuizzes->count(), "Module {$module->title} must have mini-quiz assessments.");

            foreach ($miniQuizzes as $quiz) {
                $this->assertNotNull($quiz->module_id);
                $this->assertSame($module->id, $quiz->module_id);
                $this->assertNotEmpty($quiz->question);
                $this->assertNotEmpty($quiz->option_a);
                $this->assertNotEmpty($quiz->option_b);
                $this->assertContains($quiz->correct_option, ['a', 'b', 'c', 'd']);
            }
        }
    }

    public function test_genai_course_has_final_assessments_at_course_level(): void
    {
        $this->seed(CourseSeeder::class);

        $course = Course::where('title', 'Kecerdasan Buatan Generatif & Kejuruteraan Prompt untuk Profesional')->firstOrFail();

        $finalAssessments = $course->assessments()->whereNull('module_id')->get();
        $this->assertSame(5, $finalAssessments->count(), 'Course must have 5 summative final assessment questions.');

        foreach ($finalAssessments as $final) {
            $this->assertNull($final->module_id);
            $this->assertNotEmpty($final->question);
            $this->assertContains($final->correct_option, ['a', 'b', 'c', 'd']);
        }
    }

    public function test_learner_can_access_learning_page_with_course_modules_and_quizzes(): void
    {
        $this->seed(CourseSeeder::class);

        $course = Course::where('title', 'Kecerdasan Buatan Generatif & Kejuruteraan Prompt untuk Profesional')->firstOrFail();
        $learner = $this->learner();
        $learner->enrollments()->create(['course_id' => $course->id]);

        $response = $this->actingAs($learner)
            ->get(route('learner.course.learn', $course));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('design_v1/Learner/Course/Learn')
            ->has('course.modules', 3)
            ->has('course.assessments', 11) // 6 mini-quizzes (2 x 3 modules) + 5 final assessments
        );
    }

    public function test_learner_can_pass_final_assessment_and_unlock_certificate(): void
    {
        $this->seed(CourseSeeder::class);

        $course = Course::where('title', 'Kecerdasan Buatan Generatif & Kejuruteraan Prompt untuk Profesional')->firstOrFail();
        $learner = $this->learner();
        $enrollment = $learner->enrollments()->create(['course_id' => $course->id]);

        $finalAssessments = $course->assessments()->whereNull('module_id')->get();
        $answers = $finalAssessments->mapWithKeys(fn ($a) => [$a->id => $a->correct_option])->all();

        $response = $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), [
                'answers' => $answers,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('assessment_passed', true);
        $response->assertSessionHas('assessment_score', 100);

        $enrollment->refresh();
        $this->assertNotNull($enrollment->completed_at);
        $this->assertEquals(100, $enrollment->progress);

        // Certificate should now be accessible
        $certResponse = $this->actingAs($learner)
            ->get(route('learner.course.certificate', $course));
        $certResponse->assertOk();
    }

    public function test_learner_failing_final_assessment_cannot_unlock_certificate(): void
    {
        $this->seed(CourseSeeder::class);

        $course = Course::where('title', 'Kecerdasan Buatan Generatif & Kejuruteraan Prompt untuk Profesional')->firstOrFail();
        $learner = $this->learner();
        $enrollment = $learner->enrollments()->create(['course_id' => $course->id]);

        $finalAssessments = $course->assessments()->whereNull('module_id')->get();
        // Answer every question with wrong answer
        $answers = $finalAssessments->mapWithKeys(fn ($a) => [$a->id => $a->correct_option === 'a' ? 'b' : 'a'])->all();

        $response = $this->actingAs($learner)
            ->post(route('learner.course.assess', $course), [
                'answers' => $answers,
            ]);

        $response->assertRedirect();
        $response->assertSessionHas('assessment_passed', false);

        $enrollment->refresh();
        $this->assertNull($enrollment->completed_at);

        // Certificate route redirects or returns error if not completed
        $certResponse = $this->actingAs($learner)
            ->get(route('learner.course.certificate', $course));
        $certResponse->assertRedirect();
    }

    public function test_seeded_kssr_primary_mathematics_courses_exist_for_tahun_1_2_and_3(): void
    {
        $this->seed(CourseSeeder::class);

        $expectedTitles = [
            'Matematik Tahun 1 KSSR (Jilid 1): Nombor Hingga 100, Tambah & Tolak',
            'Matematik Tahun 2 KSSR (Jilid 2): Pecahan, Wang, Masa, Ukuran & Bentuk',
            'Matematik Tahun 3 KSSR (Jilid 2): Wang, Masa, Ukuran Metrik, Prisma & Data',
        ];

        foreach ($expectedTitles as $title) {
            $course = Course::where('title', $title)->with('modules.lessons')->first();
            $this->assertNotNull($course, "KSSR course '{$title}' should be seeded.");
            $this->assertSame('published', $course->status);
            $this->assertSame('free', $course->billing_type);
            $this->assertNotEmpty($course->bundle_url, "KSSR course '{$title}' should have a downloadable KPM textbook PDF URL.");
            $this->assertSame(3, $course->modules->count(), "KSSR course '{$title}' should have 3 modules.");

            $finalQuestions = $course->assessments()->whereNull('module_id')->get();
            $this->assertSame(5, $finalQuestions->count(), "KSSR course '{$title}' should have 5 final assessment questions.");
        }
    }
}

