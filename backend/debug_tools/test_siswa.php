<?php
$ch = curl_init('http://localhost:8000/api/konselings?siswa_id=5');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);
file_put_contents('test_out_siswa.txt', $response);
