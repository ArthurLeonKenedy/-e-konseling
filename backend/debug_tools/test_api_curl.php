<?php
$url = "http://localhost:8000/api/konselings?guru_id=1";
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo "Response from API (guru_id=1):\n";
echo $response . "\n";

$url2 = "http://localhost:8000/api/konselings";
$ch2 = curl_init($url2);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
$response2 = curl_exec($ch2);
curl_close($ch2);

echo "\nResponse from API (all):\n";
echo $response2 . "\n";
