<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_profile_page(): void
    {
        $learner = User::factory()->learner()->create();

        $response = $this->actingAs($learner)->get(route('profile.edit'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('design_v1/Profile/Edit')
            ->has('user')
            ->has('stats')
        );

        $staff = User::factory()->staff()->create();

        $responseStaff = $this->actingAs($staff)->get(route('profile.edit'));
        $responseStaff->assertOk();
        $responseStaff->assertInertia(fn ($page) => $page
            ->component('design_v1/Profile/Edit')
            ->has('user')
            ->has('stats')
        );
    }

    public function test_guest_cannot_view_profile_page(): void
    {
        $response = $this->get(route('profile.edit'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_update_profile_information(): void
    {
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'original@example.com',
            'phone' => '+6011111111',
        ]);

        $response = $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'Dr. Jane Smith',
            'email' => 'jane.smith@uum.edu.my',
            'phone' => '+60123456789',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertSame('Dr. Jane Smith', $user->name);
        $this->assertSame('jane.smith@uum.edu.my', $user->email);
        $this->assertSame('+60123456789', $user->phone);
    }

    public function test_user_cannot_update_profile_with_existing_email(): void
    {
        $user1 = User::factory()->create(['email' => 'first@example.com']);
        $user2 = User::factory()->create(['email' => 'second@example.com']);

        $response = $this->actingAs($user1)->patch(route('profile.update'), [
            'name' => 'First User',
            'email' => 'second@example.com',
            'phone' => '+60123456789',
        ]);

        $response->assertSessionHasErrors(['email']);
        $user1->refresh();
        $this->assertSame('first@example.com', $user1->email);
    }

    public function test_user_can_update_password_with_correct_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password-123'),
        ]);

        $response = $this->actingAs($user)->put(route('profile.password'), [
            'current_password' => 'old-password-123',
            'password' => 'new-secure-password-456',
            'password_confirmation' => 'new-secure-password-456',
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertTrue(Hash::check('new-secure-password-456', $user->password));
    }

    public function test_user_cannot_update_password_with_incorrect_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password-123'),
        ]);

        $response = $this->actingAs($user)->put(route('profile.password'), [
            'current_password' => 'wrong-current-password',
            'password' => 'new-secure-password-456',
            'password_confirmation' => 'new-secure-password-456',
        ]);

        $response->assertSessionHasErrors(['current_password']);

        $user->refresh();
        $this->assertTrue(Hash::check('old-password-123', $user->password));
    }
}
