<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

echo "Gurus:\n";
foreach (User::where('role', 'guru')->get() as $u) {
    echo "'{$u->name}'\n";
}
