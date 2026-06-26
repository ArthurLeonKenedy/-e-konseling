<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Konseling;
use App\Models\User;

$konselings = Konseling::with(['siswa', 'guru'])->get();

echo "Total Konseling: " . $konselings->count() . "\n";
foreach ($konselings as $k) {
    echo "ID: {$k->id} | Siswa: {$k->siswa->name} | Guru: " . ($k->guru ? $k->guru->name : 'NULL') . " (ID: {$k->guru_id}) | Status: {$k->status}\n";
}

$gurus = User::where('role', 'guru')->get();
echo "\nDAFTAR GURU:\n";
foreach ($gurus as $g) {
    echo "ID: {$g->id} | Nama: {$g->name}\n";
}
