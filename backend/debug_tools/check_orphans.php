<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Konseling;

$konselings = Konseling::all();
echo "Total Konseling: " . $konselings->count() . "\n";

foreach ($konselings as $k) {
    echo "ID: {$k->id} | Siswa ID: {$k->siswa_id} | Guru ID: {$k->guru_id} | Status: {$k->status}\n";
    if ($k->siswa) {
        echo "  - Siswa Found: {$k->siswa->name}\n";
    } else {
        echo "  - ERROR: Siswa NOT FOUND for ID {$k->siswa_id}\n";
    }
    
    if ($k->guru) {
        echo "  - Guru Found: {$k->guru->name}\n";
    } else {
        echo "  - ERROR: Guru NOT FOUND for ID {$k->guru_id}\n";
    }
}
