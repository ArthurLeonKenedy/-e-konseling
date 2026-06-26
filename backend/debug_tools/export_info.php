<?php
try {
    $db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $result = [];

    // Data siswa
    $stmt = $db->query("SELECT name, kelas, nisn FROM users WHERE role='siswa' ORDER BY kelas, name LIMIT 20");
    $result['siswa'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Data guru
    $stmt = $db->query("SELECT name FROM users WHERE role='guru'");
    $result['guru'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Status konseling
    $result['status'] = [
        'konselings' => (int)$db->query('SELECT COUNT(*) FROM konselings')->fetchColumn(),
        'chats' => (int)$db->query('SELECT COUNT(*) FROM chats')->fetchColumn(),
        'surat_panggilans' => (int)$db->query('SELECT COUNT(*) FROM surat_panggilans')->fetchColumn(),
    ];

    file_put_contents(__DIR__ . '/db_info.json', json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    echo "OK - saved to db_info.json\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
