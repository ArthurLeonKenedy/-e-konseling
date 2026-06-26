<?php
try {
    $db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    $stmt = $db->query("SELECT name, kelas FROM users WHERE role='siswa'");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "=== DAFTAR SISWA ===" . PHP_EOL;
    foreach ($rows as $r) {
        echo "Nama : " . $r['name'] . PHP_EOL;
        echo "Kelas: " . $r['kelas'] . PHP_EOL;
        echo "---" . PHP_EOL;
    }
    echo PHP_EOL . "Password semua siswa: password123" . PHP_EOL;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
