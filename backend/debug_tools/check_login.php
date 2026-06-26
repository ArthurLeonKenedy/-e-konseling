<?php
$db = new PDO('sqlite:C:/Users/USER/Documents/ekonseling_export/backend/database/database.sqlite');

echo "=== DAFTAR AKUN LOGIN E-KONSELING ===" . PHP_EOL . PHP_EOL;

// Admin
echo "--- ADMIN ---" . PHP_EOL;
$q = $db->query("SELECT name FROM users WHERE role='admin'");
while ($r = $q->fetch(PDO::FETCH_ASSOC)) {
    echo "Nama: " . $r['name'] . PHP_EOL;
}

echo PHP_EOL . "--- GURU BK ---" . PHP_EOL;
$q = $db->query("SELECT name FROM users WHERE role='guru'");
while ($r = $q->fetch(PDO::FETCH_ASSOC)) {
    echo "Nama: " . $r['name'] . PHP_EOL;
}

echo PHP_EOL . "--- SISWA (5 contoh) ---" . PHP_EOL;
$q = $db->query("SELECT name, kelas FROM users WHERE role='siswa' LIMIT 5");
while ($r = $q->fetch(PDO::FETCH_ASSOC)) {
    echo "Nama: " . $r['name'] . " | Kelas: " . $r['kelas'] . PHP_EOL;
}

echo PHP_EOL . "Total siswa: ";
$q = $db->query("SELECT COUNT(*) as total FROM users WHERE role='siswa'");
$r = $q->fetch(PDO::FETCH_ASSOC);
echo $r['total'] . PHP_EOL;
