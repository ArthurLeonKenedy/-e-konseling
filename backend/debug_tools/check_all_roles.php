<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$roles = DB::table('users')
    ->select('role', DB::raw('COUNT(*) as qty'))
    ->groupBy('role')
    ->get();

echo "=== USER COUNTS BY ROLE ===\n\n";
foreach ($roles as $r) {
    $roleName = $r->role ?? 'NULL';
    echo "Role: '{$roleName}' | Count: {$r->qty}\n";
}
