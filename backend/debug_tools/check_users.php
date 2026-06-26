<?php
try {
    $db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    
    // Cek dulu apakah password123 cocok
    $stmt = $db->query("SELECT id, name, kelas, password FROM users WHERE role='siswa' LIMIT 1");
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "=== CEK PASSWORD SAAT INI ===\n";
    $hashCheck = password_verify('password123', $user['password']);
    echo "password123 " . ($hashCheck ? "COCOK ✓" : "TIDAK COCOK ✗") . " untuk siswa: {$user['name']}\n\n";
    
    if (!$hashCheck) {
        echo "=== RESET SEMUA PASSWORD SISWA ke 'password123' ===\n";
        $newHash = password_hash('password123', PASSWORD_BCRYPT, ['cost' => 12]);
        
        $update = $db->prepare("UPDATE users SET password = ? WHERE role = 'siswa'");
        $update->execute([$newHash]);
        $affected = $update->rowCount();
        
        echo "Berhasil update password untuk $affected siswa!\n";
        echo "Semua siswa sekarang bisa login dengan password: password123\n";
    }
    
    // Tampilkan data untuk login
    echo "\n=== CONTOH DATA LOGIN SISWA ===\n";
    $stmt = $db->query("SELECT name, kelas FROM users WHERE role='siswa' LIMIT 5");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as $row) {
        echo "Nama: [{$row['name']}] | Kelas: [{$row['kelas']}]\n";
    }
    echo "\nPassword: password123\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
