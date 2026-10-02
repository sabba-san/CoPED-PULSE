<?php

namespace Database\Factories;

use App\Models\Enrollment;
use App\Models\User;
use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends Factory<Enrollment>
 */
class EnrollmentFactory extends Factory
{
    protected $model = Enrollment::class;

    public function definition(): array
    {
        $enrolledAt = fake()->dateTimeBetween('-30 days', 'now');
        $progress = fake()->randomFloat(2, 0, 100);
        $completedAt = $progress >= 100 ? fake()->dateTimeBetween($enrolledAt, 'now') : null;

        return [
            'user_id' => User::factory(),
            'course_id' => Course::factory(),
            'progress' => $progress,
            'enrolled_at' => $enrolledAt,
            'completed_at' => $completedAt,
        ];
    }

    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }

    public function forCourse(Course $course): static
    {
        return $this->state(fn (array $attributes) => [
            'course_id' => $course->id,
        ]);
    }

    public function inProgress(): static
    {
        return $this->state(fn (array $attributes) => [
            'progress' => fake()->randomFloat(2, 1, 99),
            'completed_at' => null,
        ]);
    }

    public function completed(): static
    {
        $enrolledAt = fake()->dateTimeBetween('-60 days', '-10 days');
        return $this->state(fn (array $attributes) => [
            'progress' => 100.00,
            'enrolled_at' => $enrolledAt,
            'completed_at' => fake()->dateTimeBetween($enrolledAt, 'now'),
        ]);
    }

    public function notStarted(): static
    {
        return $this->state(fn (array $attributes) => [
            'progress' => 0.00,
            'completed_at' => null,
        ]);
    }
}