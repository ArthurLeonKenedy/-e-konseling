<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\App\Models\Konseling::truncate(); // delete all

$data = json_encode([
    'siswa_id' => 5, // ABDURAHMAN
    'guru_name' => 'DALINA S.Pd',
    'tanggal' => '2026-06-15',
    'waktu' => '08:30',
    'topik' => '[Lainnya] bla bla bla bla'
]);

$ch = curl_init('http://localhost:8000/api/konselings');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);

echo "Inserted booking for DALINA from ABDURAHMAN:\n";
echo $response . "\n\n";

// Now simulate how Guru page fetches data for DALINA (guru_id = 3)
$ch2 = curl_init('http://localhost:8000/api/konselings?guru_id=3');
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
$response2 = curl_exec($ch2);
curl_close($ch2);

echo "Guru DALINA's dashboard data:\n";
echo $response2;
