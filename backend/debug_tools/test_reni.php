<?php
$data = json_encode([
    'siswa_id' => 5, // ABDURAHMAN
    'guru_name' => 'RENI JULIANTI S.Pd',
    'tanggal' => '2026-06-12',
    'waktu' => '10:00',
    'topik' => 'Test 2'
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

file_put_contents('test_out2.txt', $response);
