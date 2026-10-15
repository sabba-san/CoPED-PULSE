<?php

namespace Database\Factories;

use App\Models\Organization;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Organization>
 */
class OrganizationFactory extends Factory
{
    protected $model = Organization::class;

    public function definition(): array
    {
        $name = fake()->unique()->company();

        return [
            'name' => $name,
            // Slug auto-generates from name via Organization::booted if omitted,
            // but set explicitly here so factory output is deterministic.
            'slug' => \Illuminate\Support\Str::slug($name) . '-' . fake()->unique()->randomNumber(5),
            'logo' => null,
        ];
    }
}
