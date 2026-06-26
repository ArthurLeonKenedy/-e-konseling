<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "Users:\n";
foreach (\App\Models\User::all() as $u) {
    echo "ID: {$u->id}, Name: {$u->name}, Role: {$u->role}\n";
}

echo "\nSchedules:\n";
$schedules = \Illuminate\Support\Facades\DB::table('schedules')->get();
foreach ($schedules as $s) {
    echo "ID: {$s->id}, Guru ID: {$s->guru_id}\n";
}

echo "\nKonseling:\n";
foreach (\App\Models\Konseling::all() as $k) {
    echo "ID: {$k->id}, Siswa ID: {$k->siswa_id}, Guru ID: {$k->guru_id}, Topik: {$k->topik}\n";
}
