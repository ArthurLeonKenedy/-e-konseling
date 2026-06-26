<?php
$db = new PDO('sqlite:database/database.sqlite');
$stmt = $db->query('SELECT k.id, k.siswa_id, k.guru_id, k.status, u.name as siswa_name, u.kelas FROM konselings k LEFT JOIN users u ON k.siswa_id = u.id ORDER BY k.created_at DESC LIMIT 10');
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo json_encode($r) . PHP_EOL;
}
