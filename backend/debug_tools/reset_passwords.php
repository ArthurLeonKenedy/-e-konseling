<?php
// Update password langsung via PDO (lebih cepat, tanpa bcrypt cost 12)
// cost 10 lebih cepat dan masih aman
$newHash = password_hash('password123', PASSWORD_BCRYPT, ['cost' => 10]);

try {
    $db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Hitung dulu
    $count = $db->query("SELECT COUNT(*) FROM users WHERE role='siswa'")->fetchColumn();
    echo "Total siswa: $count\n";
    
    // Update semua sekaligus (1 query, sangat cepat)
    $stmt = $db->prepare("UPDATE users SET password = ? WHERE role = 'siswa'");
    $stmt->execute([$newHash]);
    
    echo "Password berhasil di-reset untuk semua siswa!\n\n";
    
    // Verifikasi
    $row = $db->query("SELECT password FROM users WHERE role='siswa' LIMIT 1")->fetch();
    $ok = password_verify('password123', $row['password']);
    echo "Verifikasi: password123 " . ($ok ? "COCOK ✓" : "GAGAL ✗") . "\n\n";
    
    // Tampilkan contoh data login
    echo "=== CONTOH DATA LOGIN SISWA ===\n";
    $rows = $db->query("SELECT name, kelas FROM users WHERE role='siswa' LIMIT 5")->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $r) {
        echo "Nama: {$r['name']} | Kelas: {$r['kelas']}\n";
    }
    echo "\nPassword: password123\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
