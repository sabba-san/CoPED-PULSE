<?php

namespace Tests\Feature;

use App\Models\Course;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CatalogTest extends TestCase
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

    public function test_catalog_returns_published_courses_with_modules_count_and_enrolled_ids(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();

        $courseA = Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Alpha Course',
        ]);
        $courseA->modules()->create(['title' => 'Mod 1', 'order' => 1]);
        $courseA->modules()->create(['title' => 'Mod 2', 'order' => 2]);

        $courseB = Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Beta Course',
        ]);

        $learner->enrollments()->create(['course_id' => $courseA->id]);

        $response = $this->actingAs($learner)->get(route('learner.catalog'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('design_v1/Learner/Catalog', false)
            ->has('courses', 2)
            ->where('courses', fn ($courses) =>
                $courses->contains('id', $courseA->id) &&
                $courses->firstWhere('id', $courseA->id)['modules_count'] === 2 &&
                $courses->contains('id', $courseB->id) &&
                $courses->firstWhere('id', $courseB->id)['modules_count'] === 0
            )
            ->where('enrolledCourseIds', [$courseA->id])
            ->where('filters.q', '')
        );
    }

    public function test_catalog_search_filters_published_courses_by_title(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();

        Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Child Protection Fundamentals',
        ]);
        Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Community Safety Protocols',
        ]);

        $response = $this->actingAs($learner)->get(route('learner.catalog', ['q' => 'Protection']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('design_v1/Learner/Catalog', false)
            ->has('courses', 1)
            ->where('courses.0.title', 'Child Protection Fundamentals')
            ->where('filters.q', 'Protection')
        );
    }

    public function test_catalog_search_filters_published_courses_by_description(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();

        Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Ethics 101',
            'description' => 'Applied ethics for social workers and frontline staff',
        ]);
        Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Leadership',
            'description' => 'Managing nonprofit organizations',
        ]);

        $response = $this->actingAs($learner)->get(route('learner.catalog', ['q' => 'social workers']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('design_v1/Learner/Catalog', false)
            ->has('courses', 1)
            ->where('courses.0.title', 'Ethics 101')
        );
    }

    public function test_catalog_empty_search_returns_all_published_courses(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();

        Course::factory()->published()->forInstructor($staff)->create(['title' => 'One']);
        Course::factory()->published()->forInstructor($staff)->create(['title' => 'Two']);
        Course::factory()->draft()->forInstructor($staff)->create(['title' => 'Draft']);

        $response = $this->actingAs($learner)->get(route('learner.catalog', ['q' => '']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('design_v1/Learner/Catalog', false)
            ->has('courses', 2)
        );
    }

    public function test_catalog_search_filters_by_module_title_and_llm(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();

        $aiCourse = Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Generative AI Professional Track',
            'description' => 'Prompt engineering and RAG applications.',
        ]);
        $aiCourse->modules()->create([
            'title' => 'Modul 1: Asas Model Bahasa Besar (LLM)',
            'order' => 1,
        ]);

        Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Maritime Cyber Security',
            'description' => 'Vessel traffic service security.',
        ]);

        $response = $this->actingAs($learner)->get(route('learner.catalog', ['q' => 'llm']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('design_v1/Learner/Catalog', false)
            ->has('courses', 1)
            ->where('courses.0.id', $aiCourse->id)
            ->has('courses.0.modules', 1)
        );
    }

    public function test_catalog_search_filters_by_tokenized_multi_word_query(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();

        $llmCourse = Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Generative AI Professional Track',
            'description' => 'Applied prompt engineering.',
        ]);
        $llmCourse->modules()->create([
            'title' => 'Modul 1: Model Bahasa Besar (LLM)',
            'order' => 1,
        ]);

        Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Maritime Cyber Security',
            'description' => 'Vessel operations.',
        ]);

        $response = $this->actingAs($learner)->get(route('learner.catalog', ['q' => 'llm uum']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('design_v1/Learner/Catalog', false)
            ->has('courses', 1)
            ->where('courses.0.id', $llmCourse->id)
        );
    }

    public function test_catalog_search_filters_by_cert_title(): void
    {
        $staff = $this->staff();
        $learner = $this->learner();

        $capmCourse = Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Project Management Foundations',
            'cert_title' => 'CAPM® · Certified Associate in Project Management',
        ]);

        Course::factory()->published()->forInstructor($staff)->create([
            'title' => 'Basic Hygiene Promotion',
            'cert_title' => 'Public Health Essentials',
        ]);

        $response = $this->actingAs($learner)->get(route('learner.catalog', ['q' => 'CAPM']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('design_v1/Learner/Catalog', false)
            ->has('courses', 1)
            ->where('courses.0.id', $capmCourse->id)
        );
    }
}
