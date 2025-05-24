<?php

namespace Database\Seeders;

use App\Models\Config;
use App\Models\Record;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::create([
            'name' => 'Antonio',
            'email' => 'antonio@localhost',
            'email_verified_at' => now(),
            'password' => bcrypt('123456')
        ]);
        Config::create([
            'user_id' => User::where('email', 'antonio@localhost')->first()->id,
            'ask_location_permission' => true
        ]);
        
        /* Record::factory(10)->create(); */
    }
}
