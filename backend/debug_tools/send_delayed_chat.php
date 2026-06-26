<?php
sleep(40);

function sendMessage($message) {
    $ch = curl_init('http://localhost:8000/api/chats');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'sender_id' => 5, // ABDURAHMAN
        'receiver_id' => 1, // ELDATINA S.Pd
        'message' => $message
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

echo sendMessage('Halo Bu ELDATINA, apakah ibu ada waktu?');
sleep(5);
echo sendMessage('Saya ingin meminta saran bimbingan penjurusan.');
