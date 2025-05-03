<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Record>
 */
class RecordFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {   
        $date = $this->faker->dateTimeBetween('-6 months', 'now');
        return [
            'user_id' => User::where('email', 'antonio@localhost')->first()->id,
            'title' => $this->faker->sentence(rand(1, 3),false),
            'description' => $this->faker->optional()->text(),
            'latitude' => $this->faker->latitude(37.579, 37.650),
            'longitude' => $this->faker->longitude(-0.94, -1.04),
            'created_at' => $date,
            'updated_at' => $date,
        ];
    }
}
