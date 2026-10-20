<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StaffCourseTest extends TestCase
{
    use RefreshDatabase;

    private function staff(array $attributes = []): User
    {
        return User::factory()->staff()->create($attributes);
    }

    private function learner(): User
    {
        return User::factory()->learner()->create();
    }

    public function test_staff_can_view_courses_index(): void
    {
        $staff = $this->staff();
        Course::factory()->published()->forInstructor($staff)->create(['title' => 'My Active Course']);

        $response = $this->actingAs($staff)->get(route('staff.courses.index'));

        $response->assertOk();
    }

    public function test_staff_can_view_course_create_form(): void
    {
        $staff = $this->staff();

        $response = $this->actingAs($staff)->get(route('staff.courses.create'));

        $response->assertOk();
    }

    public function test_staff_can_store_new_course(): void
    {
        $staff = $this->staff();

        $response = $this->actingAs($staff)->post(route('staff.courses.store'), [
            'title' => 'Cybersecurity Essentials',
            'description' => 'A comprehensive introduction to modern cybersecurity principles.',
            'status' => 'draft',
        ]);

        $response->assertRedirect(route('staff.courses.index'));
        $this->assertDatabaseHas('courses', [
            'title' => 'Cybersecurity Essentials',
            'instructor_id' => $staff->id,
            'status' => 'draft',
        ]);
    }

    public function test_wizard_store_redirects_to_action_hub(): void
    {
        $staff = $this->staff();

        $response = $this->actingAs($staff)->post(route('staff.courses.store'), [
            'title' => 'Wizard Created Subject',
            'description' => 'Created through the 3-step wizard.',
            'status' => 'draft',
            'redirect_to_hub' => true,
        ]);

        $course = \App\Models\Course::where('title', 'Wizard Created Subject')->firstOrFail();

        $response->assertRedirect(route('staff.courses.edit', $course->id));
        $response->assertSessionHas('success', 'Subject created! Choose an action below to build your curriculum.');
    }

    public function test_course_creation_requires_valid_data(): void
    {
        $staff = $this->staff();

        $response = $this->actingAs($staff)->post(route('staff.courses.store'), [
            'title' => '',
            'status' => 'invalid-status',
        ]);

        $response->assertSessionHasErrors(['title', 'status']);
        $this->assertDatabaseCount('courses', 0);
    }

    public function test_staff_can_view_own_course_show_page(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $response = $this->actingAs($staff)->get(route('staff.courses.show', $course));

        $response->assertOk();
    }

    public function test_staff_can_view_own_course_edit_page(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $response = $this->actingAs($staff)->get(route('staff.courses.edit', $course));

        $response->assertOk();
    }

    public function test_staff_can_update_own_course(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->draft()->forInstructor($staff)->create(['title' => 'Initial Title']);

        $response = $this->actingAs($staff)->put(route('staff.courses.update', $course), [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
            'status' => 'published',
        ]);

        $response->assertRedirect(route('staff.courses.index'));
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'title' => 'Updated Title',
            'status' => 'published',
        ]);
    }

    public function test_course_update_validates_required_fields(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create(['title' => 'Unchanged']);

        $response = $this->actingAs($staff)->put(route('staff.courses.update', $course), [
            'title' => '',
            'status' => 'not-a-valid-status',
        ]);

        $response->assertSessionHasErrors(['title', 'status']);
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'title' => 'Unchanged',
        ]);
    }

    public function test_staff_can_delete_own_course(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $response = $this->actingAs($staff)->delete(route('staff.courses.destroy', $course));

        $response->assertRedirect(route('staff.courses.index'));
        $this->assertDatabaseMissing('courses', ['id' => $course->id]);
    }

    public function test_partner_staff_cannot_update_foreign_partner_course(): void
    {
        $orgA = Organization::factory()->create();
        $orgB = Organization::factory()->create();

        $owner = User::factory()->staff()->create(['organization_id' => $orgA->id]);
        $intruder = User::factory()->staff()->create(['organization_id' => $orgB->id]);

        $course = Course::factory()->published()->forInstructor($owner)->forOrganization($orgA)->create();

        $response = $this->actingAs($intruder)->put(route('staff.courses.update', $course), [
            'title' => 'Hacked Title',
            'status' => 'published',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('courses', ['title' => 'Hacked Title']);
    }

    public function test_staff_can_store_course_with_studio_metadata(): void
    {
        $staff = $this->staff();

        $response = $this->actingAs($staff)->post(route('staff.courses.store'), [
            'title' => 'Project Management Professional',
            'description' => 'Comprehensive CAPM prep course.',
            'status' => 'draft',
            'academic_year' => '2026 / 2027 · Intake 1',
            'category_logo' => 'capm',
            'billing_type' => 'subscription',
            'price' => 199.00,
            'cert_title' => 'CAPM® · Certified Associate in Project Management',
            'cert_url' => 'https://www.pmi.org/certifications/certified-associate-capm',
            'bundle_title' => 'Complete PMBOK 7th Ed Study Bundle',
            'bundle_url' => 'https://drive.google.com/drive/folders/test-bundle',
        ]);

        $response->assertRedirect(route('staff.courses.index'));
        $this->assertDatabaseHas('courses', [
            'title' => 'Project Management Professional',
            'category_logo' => 'capm',
            'billing_type' => 'subscription',
            'academic_year' => '2026 / 2027 · Intake 1',
            'price' => 199.00,
            'cert_title' => 'CAPM® · Certified Associate in Project Management',
            'bundle_title' => 'Complete PMBOK 7th Ed Study Bundle',
        ]);
    }

    public function test_staff_can_deploy_draft_course_in_one_click(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->draft()->forInstructor($staff)->create();

        $response = $this->actingAs($staff)->post(route('staff.courses.deploy', $course));

        $response->assertSessionHas('success', 'Course deployed and live in the CoPED Catalog!');
        $this->assertDatabaseHas('courses', [
            'id' => $course->id,
            'status' => 'published',
        ]);
    }

    public function test_learner_cannot_access_staff_courses(): void
    {
        $learner = $this->learner();

        $response = $this->actingAs($learner)->get(route('staff.courses.index'));

        $this->assertTrue(in_array($response->getStatusCode(), [302, 403]));
    }
}
