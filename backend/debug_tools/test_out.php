<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$out = "Users:\n";
foreach (\App\Models\User::all() as $u) {
    if ($u->role === 'guru') {
        $out .= "ID: {$u->id}, Name: {$u->name}, Role: {$u->role}\n";
    }
}
$out .= "\nSchedules:\n";
$schedules = \Illuminate\Support\Facades\DB::table('schedules')->get();
foreach ($schedules as $s) {
    $out .= "ID: {$s->id}, Guru ID: {$s->guru_id}, Guru Name (stored if any): " . ($s->guru_name ?? 'N/A') . "\n";
}
$out .= "\nKonseling:\n";
foreach (\App\Models\Konseling::all() as $k) {
    $out .= "ID: {$k->id}, Siswa ID: {$k->siswa_id}, Guru ID: {$k->guru_id}, Topik: {$k->topik}\n";
}
file_put_contents('test_out.txt', $out);
