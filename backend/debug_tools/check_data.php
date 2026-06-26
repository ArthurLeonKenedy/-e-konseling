<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\DB;

echo "--- GURUS ---\n";
$gurus = User::where('role', 'guru')->get(['id', 'name']);
foreach ($gurus as $g) {
    echo "ID: {$g->id}, Name: {$g->name}\n";
}

echo "\n--- SCHEDULES ---\n";
$schedules = DB::table('schedules')->get();
foreach ($schedules as $s) {
    echo "ID: {$s->id}, Guru ID: {$s->guru_id}, Status: {$s->status}\n";
}
