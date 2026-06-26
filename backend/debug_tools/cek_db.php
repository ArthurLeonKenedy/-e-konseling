<?php
try {
    $db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Tampilkan semua data siswa
    echo "=== DATA SISWA ===\n";
    $stmt = $db->query("SELECT name, kelas, nisn FROM users WHERE role='siswa' ORDER BY kelas, name LIMIT 20");
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
        echo "Nama: " . $r['name'] . " | Kelas: " . $r['kelas'] . " | NISN: " . ($r['nisn'] ?? '-') . "\n";
    }

    echo "\n=== DATA GURU BK ===\n";
    $stmt = $db->query("SELECT name FROM users WHERE role='guru'");
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
        echo "Nama: " . $r['name'] . "\n";
    }

    echo "\n=== STATUS RIWAYAT KONSELING ===\n";
    echo "konselings : " . $db->query('SELECT COUNT(*) FROM konselings')->fetchColumn() . " data\n";
    echo "chats      : " . $db->query('SELECT COUNT(*) FROM chats')->fetchColumn() . " data\n";
    echo "surat panggilans: " . $db->query('SELECT COUNT(*) FROM surat_panggilans')->fetchColumn() . " data\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
