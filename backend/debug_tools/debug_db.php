<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$out = "--- ALL USERS WITH ROLE GURU ---\n";
$gurus = \App\Models\User::where('role', 'guru')->get();
foreach ($gurus as $u) {
    $out .= "ID: {$u->id}, Name: [{$u->name}]\n";
}

$out .= "\n--- ALL SCHEDULES ---\n";
$schedules = \Illuminate\Support\Facades\DB::table('schedules')->get();
if ($schedules->isEmpty()) {
    $out .= "No schedules found.\n";
} else {
    foreach ($schedules as $s) {
        $out .= "ID: {$s->id}, Guru ID: {$s->guru_id}, Status: {$s->status}\n";
    }
}

file_put_contents('debug_results.txt', $out);
echo "Results written to debug_results.txt\n";
