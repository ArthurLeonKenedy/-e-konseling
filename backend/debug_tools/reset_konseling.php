<?php
try {
    $db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Hapus semua riwayat konseling
    $db->exec('DELETE FROM konselings');
    $db->exec('DELETE FROM chats');
    $db->exec('DELETE FROM surat_panggilans');

    echo "=== RESET RIWAYAT KONSELING ===\n";
    echo "konselings tersisa : " . $db->query('SELECT COUNT(*) FROM konselings')->fetchColumn() . "\n";
    echo "chats tersisa      : " . $db->query('SELECT COUNT(*) FROM chats')->fetchColumn() . "\n";
    echo "surat_panggilans   : " . $db->query('SELECT COUNT(*) FROM surat_panggilans')->fetchColumn() . "\n";
    echo "Semua riwayat konseling berhasil dihapus!\n\n";

    // Tampilkan data siswa
    echo "=== CONTOH DATA SISWA (10 pertama) ===\n";
    $stmt = $db->query("SELECT name, kelas, nisn FROM users WHERE role='siswa' LIMIT 10");
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
        echo "Nama: " . $r['name'] . " | Kelas: " . $r['kelas'] . " | NISN: " . $r['nisn'] . "\n";
    }

    // Tampilkan data guru
    echo "\n=== DATA GURU BK ===\n";
    $stmt = $db->query("SELECT name FROM users WHERE role='guru'");
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $r) {
        echo "Nama: " . $r['name'] . "\n";
    }

    echo "\nPassword default semua akun: password123\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
