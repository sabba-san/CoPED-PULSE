<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CertificateTest extends TestCase
{
    use RefreshDatabase;

    private function learner(): User
    {
        return User::factory()->learner()->create();
    }

    private function staff(): User
    {
        return User::factory()->staff()->create();
    }

    public function test_completed_learner_can_view_certificate(): void
    {
        $learner = $this->learner();
        $instructor = $this->staff();
        $course = Course::factory()->published()->forInstructor($instructor)->create([
            'academic_year' => '2026 / 2027 · Intake 1',
            'category_logo' => 'maritime',
            'cert_title' => 'JLM Pelaut & Pegawai Operasi Maritim Certified',
            'cert_url' => 'https://www.marine.gov.my',
        ]);

        $enrollment = Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 100,
            'completed_at' => now(),
        ]);

        $response = $this->actingAs($learner)->get(route('learner.course.certificate', $course->id));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('design_v1/Learner/Course/Certificate')
            ->has('course')
            ->where('course.id', $course->id)
            ->where('course.cert_title', 'JLM Pelaut & Pegawai Operasi Maritim Certified')
            ->has('enrollment')
            ->where('enrollment.id', $enrollment->id)
        );
    }

    public function test_incomplete_learner_is_redirected_to_learn_page(): void
    {
        $learner = $this->learner();
        $instructor = $this->staff();
        $course = Course::factory()->published()->forInstructor($instructor)->create();

        Enrollment::create([
            'user_id' => $learner->id,
            'course_id' => $course->id,
            'progress' => 45,
            'completed_at' => null,
        ]);

        $response = $this->actingAs($learner)->get(route('learner.course.certificate', $course->id));

        $response->assertRedirect(route('learner.course.learn', $course->id));
        $response->assertSessionHas('error', 'Complete all modules and pass the Final Assessment with 100% to unlock your official certificate.');
    }

    public function test_non_enrolled_learner_cannot_view_certificate(): void
    {
        $learner = $this->learner();
        $instructor = $this->staff();
        $course = Course::factory()->published()->forInstructor($instructor)->create();

        $response = $this->actingAs($learner)->get(route('learner.course.certificate', $course->id));

        $response->assertNotFound();
    }

    public function test_unauthenticated_user_cannot_view_certificate(): void
    {
        $instructor = $this->staff();
        $course = Course::factory()->published()->forInstructor($instructor)->create();

        $response = $this->get(route('learner.course.certificate', $course->id));

        $response->assertRedirect(route('login'));
    }
}
