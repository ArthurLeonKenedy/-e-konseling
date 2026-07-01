<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$count = App\Models\User::count();
$siswaCount = App\Models\User::where('role', 'siswa')->count();
echo "Total users: $count, Siswa count: $siswaCount\n";
