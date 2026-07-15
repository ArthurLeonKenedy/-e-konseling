<?php
$kelas_list = ['X AKT 1', 'X AKT 2', 'X TKJ 1', 'X TKJ 2', 'XI AKT 1', 'XI TKJ 1', 'XII AKT 1', 'XII TKJ 1'];

$first_names_male = ['Ahmad', 'Budi', 'Cahyo', 'Dedi', 'Eko', 'Fajar', 'Gunawan', 'Hendra', 'Indrawan', 'Joko', 'Kurniawan', 'Lukman', 'Muhammad', 'Nugroho', 'Oki', 'Putu', 'Rian', 'Santoso', 'Teguh', 'Utama', 'Wahyu', 'Yusuf', 'Zaenal', 'Aditya', 'Bagus', 'Chandra', 'Dwi', 'Eka', 'Gilang', 'Heru', 'Iwan', 'Kadek', 'Made', 'Nyoman', 'Rudi', 'Sandy', 'Tri', 'Wawan', 'Yanto', 'Ari', 'Bambang', 'Dharma', 'Edy', 'Farhan', 'Hadi', 'Irfan', 'Krisna', 'Lutfi', 'Ridwan', 'Suryo'];
$first_names_female = ['Anisa', 'Bunga', 'Citra', 'Dewi', 'Elia', 'Fitri', 'Gita', 'Hartati', 'Indah', 'Julia', 'Kartika', 'Lestari', 'Mega', 'Nining', 'Olivia', 'Putri', 'Ratna', 'Sari', 'Triana', 'Utami', 'Wulan', 'Yani', 'Yuliana', 'Zubaidah', 'Agnes', 'Bella', 'Diana', 'Eva', 'Grace', 'Hana', 'Irma', 'Kelly', 'Linda', 'Maria', 'Nita', 'Rini', 'Sandra', 'Tika', 'Vivi', 'Yeni', 'Amalia', 'Desi', 'Evi', 'Febri', 'Hesti', 'Intan', 'Melati', 'Nova', 'Rina', 'Siska'];
$last_names = ['Saputra', 'Wijaya', 'Hidayat', 'Santoso', 'Pratama', 'Kusuma', 'Wibowo', 'Setiawan', 'Kurniawan', 'Siregar', 'Nasution', 'Harahap', 'Lubis', 'Ginting', 'Sinaga', 'Simanjuntak', 'Situmorang', 'Pangaribuan', 'Manurung', 'Hutapea', 'Tampubolon', 'Panjaitan', 'Sitorus', 'Nababan', 'Pardede', 'Hasibuan', 'Rajagukguk', 'Silitonga', 'Marbun', 'Sianipar', 'Hutabarat', 'Hutagalung', 'Aritonang', 'Simangunsong', 'Ramadhan', 'Nugraha', 'Akbar', 'Prayoga', 'Budiman', 'Prasetyo', 'Lestari', 'Putra', 'Putri', 'Sari', 'Utama'];

$first_names = array_merge($first_names_male, $first_names_female);
$names = [];

while (count($names) < 720) {
    $fn = $first_names[array_rand($first_names)];
    $ln = $last_names[array_rand($last_names)];
    $name = strtoupper($fn . ' ' . $ln);
    if (!in_array($name, $names)) {
        $names[] = $name;
    }
}

$data = [];
foreach ($names as $name) {
    $data[] = [
        'name' => $name,
        'kelas' => $kelas_list[array_rand($kelas_list)],
        'password' => 'siswa123'
    ];
}

// Add the specific test user Abdurahman at the end
$data[] = [
    'name' => 'ABDURAHMAN',
    'kelas' => 'X AKT 1',
    'password' => 'siswa123'
];

file_put_contents('../siswa.json', json_encode($data, JSON_PRETTY_PRINT));
echo "Created siswa.json with " . count($data) . " realistic students.\n";
