<?php
$kelas_list = ['X AKT 1', 'X AKT 2', 'X TKJ 1', 'X TKJ 2', 'XI AKT 1', 'XI TKJ 1', 'XII AKT 1', 'XII TKJ 1'];
$data = [];
for ($i = 1; $i <= 720; $i++) {
    $data[] = [
        'name' => 'Siswa Dummy ' . $i,
        'kelas' => $kelas_list[array_rand($kelas_list)],
        'password' => 'siswa123'
    ];
}
// Add the specific test user
$data[] = [
    'name' => 'ABDURAHMAN',
    'kelas' => 'X AKT 1',
    'password' => 'siswa123'
];
file_put_contents('../siswa.json', json_encode($data, JSON_PRETTY_PRINT));
echo "Created siswa.json with " . count($data) . " students.\n";
