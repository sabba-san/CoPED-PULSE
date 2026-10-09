<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModuleEmbedTest extends TestCase
{
    use RefreshDatabase;

    private function staff(): User
    {
        return User::factory()->create(['role' => 'staff']);
    }

    public function test_store_defaults_content_type_to_link(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $this->actingAs($staff)
            ->post(route('staff.courses.modules.store', $course), [
                'title' => 'Link module',
                'media_url' => 'https://example.com/doc.pdf',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('modules', [
            'course_id' => $course->id,
            'title' => 'Link module',
            'content_type' => 'link',
        ]);
    }

    public function test_store_accepts_embed_content_type(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $this->actingAs($staff)
            ->post(route('staff.courses.modules.store', $course), [
                'title' => 'Slides module',
                'media_url' => 'https://docs.google.com/presentation/d/abc/embed',
                'content_type' => 'embed',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('modules', [
            'course_id' => $course->id,
            'title' => 'Slides module',
            'content_type' => 'embed',
        ]);
    }

    public function test_store_rejects_invalid_content_type(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $this->actingAs($staff)
            ->post(route('staff.courses.modules.store', $course), [
                'title' => 'Bad module',
                'media_url' => 'https://example.com/x.pdf',
                'content_type' => 'video',
            ])
            ->assertSessionHasErrors('content_type');

        $this->assertDatabaseMissing('modules', ['title' => 'Bad module']);
    }

    public function test_update_accepts_content_type_change(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create([
            'title' => 'M',
            'media_url' => 'https://example.com/a.pdf',
            'content_type' => 'link',
            'order' => 1,
        ]);

        $this->actingAs($staff)
            ->put(route('staff.courses.modules.update', [$course, $module]), [
                'title' => 'M',
                'media_url' => 'https://example.com/a.pdf',
                'content_type' => 'embed',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('modules', [
            'id' => $module->id,
            'content_type' => 'embed',
        ]);
    }

    public function test_update_rejects_invalid_content_type(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $module = $course->modules()->create([
            'title' => 'M',
            'content_type' => 'link',
            'order' => 1,
        ]);

        $this->actingAs($staff)
            ->put(route('staff.courses.modules.update', [$course, $module]), [
                'title' => 'M',
                'content_type' => 'bogus',
            ])
            ->assertSessionHasErrors('content_type');
    }

    public function test_media_url_is_still_validated_with_embed(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        $this->actingAs($staff)
            ->post(route('staff.courses.modules.store', $course), [
                'title' => 'Bad url',
                'media_url' => 'not-a-url',
                'content_type' => 'embed',
            ])
            ->assertSessionHasErrors('media_url');
    }

    public function test_database_default_is_link_for_legacy_rows(): void
    {
        $staff = $this->staff();
        $course = Course::factory()->published()->forInstructor($staff)->create();

        // Simulate a legacy insert that omits content_type entirely.
        $id = $course->modules()->create([
            'title' => 'Legacy',
            'order' => 1,
        ])->id;

        $this->assertEquals('link', $course->modules()->find($id)->content_type);
    }

    public function test_cross_course_update_still_404_with_embed_payload(): void
    {
        $staff = $this->staff();
        $courseA = Course::factory()->published()->forInstructor($staff)->create();
        $courseB = Course::factory()->published()->forInstructor($staff)->create();
        $moduleB = $courseB->modules()->create([
            'title' => 'B',
            'content_type' => 'link',
            'order' => 1,
        ]);

        $this->actingAs($staff)
            ->put(route('staff.courses.modules.update', [$courseA, $moduleB]), [
                'title' => 'Hacked',
                'content_type' => 'embed',
            ])
            ->assertNotFound();
    }

    public function test_learner_can_view_course_with_embed_module(): void
    {
        $staff = $this->staff();
        $learner = User::factory()->create(['role' => 'learner']);
        $course = Course::factory()->published()->forInstructor($staff)->create();
        $course->modules()->create([
            'title' => 'Slides',
            'media_url' => 'https://docs.google.com/presentation/d/abc/embed',
            'content_type' => 'embed',
            'order' => 1,
        ]);
        $learner->enrollments()->create(['course_id' => $course->id]);

        $this->actingAs($learner)
            ->get(route('learner.course.learn', $course))
            ->assertOk();
    }
}
