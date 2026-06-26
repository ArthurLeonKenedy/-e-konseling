<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// Clean up problematic data
DB::table('schedules')->truncate();

// Ensure we have some teachers
$teachers = [
    ['name' => 'ELDATINA S.P', 'role' => 'guru'],
    ['name' => 'BU BUDI', 'role' => 'guru'],
    ['name' => 'PAK BAMBANG', 'role' => 'guru'],
];

foreach ($teachers as $t) {
    $user = User::updateOrCreate(
        ['name' => $t['name']],
        [
            'role' => $t['role'],
            'password' => Hash::make('password'),
            'kelas' => 'BK'
        ]
    );

    // Create schedule for this guru
    DB::table('schedules')->insert([
        'guru_id' => $user->id,
        'hari' => 'Senin - Jumat',
        'jam_mulai' => '07:30',
        'jam_selesai' => '15:30',
        'status' => 'Tersedia',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
}

echo "Successfully seeded 3 gurus and their schedules.\n";
