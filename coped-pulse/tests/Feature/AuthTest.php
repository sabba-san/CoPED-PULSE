<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register_as_learner(): void
    {
        $response = $this->post(route('register'), [
            'name' => 'Ahmad Learner',
            'email' => 'ahmad@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'learner',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('portal'));
        $this->assertDatabaseHas('users', [
            'email' => 'ahmad@example.com',
            'role' => 'learner',
        ]);
    }

    public function test_new_users_can_register_as_staff(): void
    {
        $response = $this->post(route('register'), [
            'name' => 'Dr. Siti Staff',
            'email' => 'siti@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'staff',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard'));
        $this->assertDatabaseHas('users', [
            'email' => 'siti@example.com',
            'role' => 'staff',
        ]);
    }

    public function test_registration_requires_valid_fields(): void
    {
        $response = $this->post(route('register'), [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'mismatch',
            'role' => 'invalid-role',
        ]);

        $response->assertSessionHasErrors(['name', 'email', 'password', 'role']);
        $this->assertGuest();
    }

    public function test_registration_rejects_duplicate_email(): void
    {
        User::factory()->create(['email' => 'existing@example.com']);

        $response = $this->post(route('register'), [
            'name' => 'Duplicate User',
            'email' => 'existing@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'learner',
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get(route('login'));

        $response->assertOk();
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->learner()->create([
            'email' => 'learner@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'learner@example.com',
            'password' => 'secret123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect(route('portal'));
    }

    public function test_staff_login_redirects_to_staff_dashboard(): void
    {
        $staff = User::factory()->staff()->create([
            'email' => 'instructor@example.com',
            'password' => bcrypt('secret123'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'instructor@example.com',
            'password' => 'secret123',
        ]);

        $this->assertAuthenticatedAs($staff);
        $response->assertRedirect(route('dashboard'));
    }

    public function test_users_cannot_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'user@example.com',
            'password' => bcrypt('correct-password'),
        ]);

        $response = $this->post(route('login'), [
            'email' => 'user@example.com',
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['email']);
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_unauthenticated_user_cannot_access_dashboard(): void
    {
        $response = $this->get(route('dashboard'));

        $response->assertRedirect(route('login'));
    }

    public function test_unauthenticated_user_cannot_access_portal(): void
    {
        $response = $this->get(route('portal'));

        $response->assertRedirect(route('login'));
    }

    public function test_learner_cannot_access_staff_dashboard(): void
    {
        $learner = User::factory()->learner()->create();

        $response = $this->actingAs($learner)->get(route('dashboard'));

        // Role middleware redirects to home or unauthorized
        $this->assertTrue(in_array($response->getStatusCode(), [302, 403]));
    }

    public function test_staff_cannot_access_learner_portal(): void
    {
        $staff = User::factory()->staff()->create();

        $response = $this->actingAs($staff)->get(route('portal'));

        // Role middleware redirects to home or unauthorized
        $this->assertTrue(in_array($response->getStatusCode(), [302, 403]));
    }
}
