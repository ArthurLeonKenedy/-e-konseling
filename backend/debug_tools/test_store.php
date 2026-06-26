<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\Api\KonselingController;
use Illuminate\Http\Request;

$request = new Request();
$request->merge([
    'siswa_id' => 9,
    'guru_name' => 'ELDATINA S.Pd',
    'tanggal' => '2026-06-17',
    'waktu' => '08:30',
    'topik' => '[Pribadi] masalaha hehehehe'
]);

$controller = new KonselingController();
try {
    $response = $controller->store($request);
    echo $response->getContent();
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
