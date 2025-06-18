<?php

namespace Database\Seeders;

use App\Models\Base\UserLimit;
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

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@localhost',
            'email_verified_at' => now(),
            'password' => bcrypt(env('ADMIN_PASSWORD', 'admin')),
            'is_admin' => true,
        ]);
        
        $favorites = ['Comer', 'Ducha', 'Dormir', 'Cenar', 'Café'];
        
        foreach ($favorites as $title) {
            $admin->favorites()->create([
                'title' => $title,
            ]);
        }

    }
}
