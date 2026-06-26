<?php
$db = new PDO('sqlite:' . __DIR__ . '/database/database.sqlite');
$r = $db->query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
foreach($r as $row) echo $row['name'] . PHP_EOL;
echo "---\n";
// Check schedules data
$r2 = $db->query("SELECT id, guru_id, status FROM schedules LIMIT 5");
foreach($r2 as $row) echo "Schedule: id={$row['id']} guru_id={$row['guru_id']} status={$row['status']}" . PHP_EOL;
