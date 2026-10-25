<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubjectCoordinatorTest extends TestCase
{
    use RefreshDatabase;

    private function coordinator(array $attributes = []): User
    {
        return User::factory()->coordinator()->create($attributes);
    }

    private function staff(array $attributes = []): User
    {
        return User::factory()->staff()->create($attributes);
    }

    private function learner(array $attributes = []): User
    {
        return User::factory()->learner()->create($attributes);
    }

    public function test_coordinator_can_view_all_courses_and_dashboard(): void
    {
        $coordinator = $this->coordinator();
        $instructor1 = $this->staff(['name' => 'Lecturer One']);
        $instructor2 = $this->staff(['name' => 'Lecturer Two']);

        $course1 = Course::factory()->published()->forInstructor($instructor1)->create(['title' => 'Biology 101']);
        $course2 = Course::factory()->draft()->forInstructor($instructor2)->create(['title' => 'Chemistry 201']);

        // Dashboard access
        $dashboardResponse = $this->actingAs($coordinator)->get(route('dashboard'));
        $dashboardResponse->assertOk();

        // All courses index access
        $coursesResponse = $this->actingAs($coordinator)->get(route('staff.courses.index'));
        $coursesResponse->assertOk();
    }

    public function test_coordinator_can_create_subject_and_assign_instructor(): void
    {
        $org = Organization::factory()->create();
        $coordinator = $this->coordinator(['organization_id' => $org->id]);
        $instructor = $this->staff(['organization_id' => $org->id]);

        $response = $this->actingAs($coordinator)->post(route('staff.courses.store'), [
            'title' => 'Modern Software Architecture',
            'description' => 'Comprehensive masterclass on scalable distributed systems.',
            'status' => 'draft',
            'academic_year' => '2026 / 2027',
            'category_logo' => 'navy',
            'billing_type' => 'free',
            'price' => '0.00',
            'instructor_id' => $instructor->id,
        ]);

        $response->assertRedirect(route('staff.courses.index'));

        $this->assertDatabaseHas('courses', [
            'title' => 'Modern Software Architecture',
            'instructor_id' => $instructor->id,
            'organization_id' => $org->id,
            'status' => 'draft',
        ]);
    }

    public function test_coordinator_can_reassign_instructor_on_existing_course(): void
    {
        $org = Organization::factory()->create();
        $coordinator = $this->coordinator(['organization_id' => $org->id]);
        $initialInstructor = $this->staff(['organization_id' => $org->id]);
        $newInstructor = $this->staff(['organization_id' => $org->id]);

        $course = Course::factory()->forInstructor($initialInstructor)->create([
            'title' => 'Data Science & Analytics',
            'organization_id' => $org->id,
        ]);

        $response = $this->actingAs($coordinator)->post(route('staff.courses.assign-instructor', $course), [
            'instructor_id' => $newInstructor->id,
        ]);

        $response->assertSessionHas('success', 'Instructor assigned to subject successfully.');

        $course->refresh();
        $this->assertEquals($newInstructor->id, $course->instructor_id);
        $this->assertEquals($org->id, $course->organization_id);
    }

    public function test_assigned_instructor_can_access_and_edit_assigned_course(): void
    {
        $org = Organization::factory()->create();
        $coordinator = $this->coordinator(['organization_id' => $org->id]);
        $assignedInstructor = $this->staff(['organization_id' => $org->id]);

        $course = Course::factory()->forInstructor($coordinator)->create([
            'title' => 'Artificial Intelligence Fundamentals',
            'organization_id' => $org->id,
        ]);

        // Reassign to assignedInstructor
        $this->actingAs($coordinator)->post(route('staff.courses.assign-instructor', $course), [
            'instructor_id' => $assignedInstructor->id,
        ]);

        $course->refresh();
        $this->assertEquals($assignedInstructor->id, $course->instructor_id);

        // Assigned instructor can access edit page
        $editResponse = $this->actingAs($assignedInstructor)->get(route('staff.courses.edit', $course));
        $editResponse->assertOk();

        // Assigned instructor can update the course
        $updateResponse = $this->actingAs($assignedInstructor)->put(route('staff.courses.update', $course), [
            'title' => 'AI Fundamentals - Updated Syllabus',
            'status' => 'draft',
        ]);
        $updateResponse->assertRedirect(route('staff.courses.index'));

        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'title' => 'AI Fundamentals - Updated Syllabus',
        ]);
    }

    public function test_learner_cannot_assign_instructor(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();
        $newInstructor = $this->staff();

        $course = Course::factory()->forInstructor($staff)->create();

        $response = $this->actingAs($learner)->post(route('staff.courses.assign-instructor', $course), [
            'instructor_id' => $newInstructor->id,
        ]);

        $response->assertForbidden();
    }

    public function test_coordinator_can_manage_modules_on_any_course(): void
    {
        $org = Organization::factory()->create();
        $coordinator = $this->coordinator(['organization_id' => $org->id]);
        $instructor = $this->staff(['organization_id' => $org->id]);

        $course = Course::factory()->forInstructor($instructor)->create([
            'organization_id' => $org->id,
        ]);

        $response = $this->actingAs($coordinator)->post(route('staff.courses.modules.store', $course), [
            'title' => 'Introduction to Neural Networks',
            'content_type' => 'link',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('modules', [
            'course_id' => $course->id,
            'title' => 'Introduction to Neural Networks',
        ]);
    }

    public function test_coordinator_redirected_to_dashboard_from_root(): void
    {
        $coordinator = $this->coordinator();

        $response = $this->actingAs($coordinator)->get('/');

        $response->assertRedirect(route('dashboard'));
    }
}
