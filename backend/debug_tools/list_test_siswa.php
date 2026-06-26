<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$siswa = App\Models\User::where('role', 'siswa')->take(5)->get();
foreach ($siswa as $s) {
    echo "Nama: {$s->name} | Kelas: {$s->kelas} | NISN: {$s->nisn}\n";
}
