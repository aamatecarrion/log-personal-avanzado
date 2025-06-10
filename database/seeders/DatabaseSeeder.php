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
        // User::factory(10)->create();

        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@localhost',
            'email_verified_at' => now(),
            'password' => bcrypt(env('ADMIN_PASSWORD', 'admin')),
            'is_admin' => true,
        ]);
        
        for ($i=1; $i<=10; $i++) {
            $user = User::create([
                'name' => "Usuario $i",
                'email' => "usuario$i@localhost",
                'password' => bcrypt("usuario$i"),
            ]);
            UserLimit::create([
                'user_id' => $user->id,
                'can_upload_images' => true,
                'can_process_images' => true,
            ]);
        }
        
        $favorites = ['comer', 'ducha', 'dormir', 'cena'];
        User::all()->each(function ($user) use ($favorites) {
            foreach ($favorites as $title) {
                $user->favorites()->create([
                    'title' => $title,
                ]);
            }
        });
        

        Record::factory(10)->create();
    }
}
