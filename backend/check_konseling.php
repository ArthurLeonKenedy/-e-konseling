<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$query = \App\Models\Konseling::with(['siswa', 'guru']);
$query->where('guru_id', 759);
$konselings = $query->orderBy('created_at', 'desc')->get();

$output = json_encode(['success' => true, 'data' => $konselings], JSON_PRETTY_PRINT);
file_put_contents(__DIR__ . '/api_output.json', $output);
echo "Output saved to api_output.json\n";
echo "Total records: " . count($konselings) . "\n";
foreach ($konselings as $k) {
    echo "ID={$k->id} siswa_name=" . ($k->siswa ? $k->siswa->name : 'NULL') . " guru_name=" . ($k->guru ? $k->guru->name : 'NULL') . "\n";
}
