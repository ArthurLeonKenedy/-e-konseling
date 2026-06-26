<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$out = "--- KONSELLING DATA ---\n";
$konselings = \App\Models\Konseling::with(['siswa', 'guru'])->get();
foreach ($konselings as $k) {
    $siswaName = $k->siswa ? $k->siswa->name : 'N/A';
    $guruName = $k->guru ? $k->guru->name : 'N/A';
    $out .= "ID: {$k->id}, Siswa: {$siswaName}, Guru: {$guruName}, Status: {$k->status}\n";
}

file_put_contents('debug_results_konseling.txt', $out);
echo "Results written to debug_results_konseling.txt\n";
