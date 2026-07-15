<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Hapus test user yang menggunakan email karena kolom email tidak ada
        // User::factory()->create([
        //     'name' => 'Test User',
        // ]);

        $this->call([
            AdminSeeder::class,
            GuruSeeder::class,
            SiswaSeeder::class,
        ]);
    }
}
