<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Konseling;

$k = Konseling::find(13);
echo json_encode(['siswa_id' => $k->siswa_id, 'guru_id' => $k->guru_id, 'topik' => $k->topik]);
