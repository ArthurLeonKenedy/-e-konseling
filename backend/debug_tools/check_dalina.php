<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

foreach (\App\Models\User::where('name', 'DALINA S.Pd')->get() as $u) {
    echo "ID: {$u->id}, Role: {$u->role}, Kelas: {$u->kelas}\n";
}
