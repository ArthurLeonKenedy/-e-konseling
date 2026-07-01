<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$name = 'ABDURAHMAN';
$kelas = 'X AKT 1';
$password = 'siswa123';

$user = App\Models\User::whereRaw('LOWER(name) = ?', [strtolower($name)])
    ->where('kelas', $kelas)
    ->where('role', 'siswa')
    ->first();

if (!$user) {
    echo "User not found in DB\n";
} else {
    echo "User found: " . $user->name . "\n";
    if (\Illuminate\Support\Facades\Hash::check($password, $user->password)) {
        echo "Password matches!\n";
    } else {
        echo "Password does NOT match.\n";
    }
}
