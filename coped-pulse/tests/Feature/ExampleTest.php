<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    /**
     * A basic test example.
     */
    public function test_guest_sees_landing_page(): void
    {
        $response = $this->get('/');

        $response->assertStatus(200);
    }

    public function test_staff_is_redirected_to_dashboard(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);

        $response = $this->actingAs($staff)->get('/');

        $response->assertRedirect('/dashboard');
    }

    public function test_learner_is_redirected_to_portal(): void
    {
        $learner = User::factory()->create(['role' => 'learner']);

        $response = $this->actingAs($learner)->get('/');

        $response->assertRedirect('/portal');
    }

    public function test_login_page_loads(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_register_page_loads(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }
}