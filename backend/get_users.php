<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$siswa = App\Models\User::where('role', 'siswa')->first();
if ($siswa) {
    $siswa->password = Illuminate\Support\Facades\Hash::make('siswa123');
    $siswa->save();
    echo "Siswa: " . $siswa->name . " (Kelas: " . $siswa->kelas . ") - Password reset to: siswa123\n";
} else {
    echo "Tidak ada siswa ditemukan.\n";
}
