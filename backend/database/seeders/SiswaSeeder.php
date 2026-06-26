<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\File;

class SiswaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $jsonPath = base_path('../siswa.json');
        
        if (!File::exists($jsonPath)) {
            $this->command->error("File siswa.json tidak ditemukan di " . $jsonPath);
            return;
        }

        $json = File::get($jsonPath);
        $siswaData = json_decode($json, true);

        if (is_null($siswaData)) {
            $this->command->error("Gagal mendecode JSON dari siswa.json");
            return;
        }

        $this->command->info("Mengimpor " . count($siswaData) . " data siswa...");

        // Chunking untuk performa yang lebih baik
        $chunks = array_chunk($siswaData, 100);

        foreach ($chunks as $chunk) {
            $dataToInsert = [];
            foreach ($chunk as $item) {
                $dataToInsert[] = [
                    'name' => $item['name'],
                    'kelas' => $item['kelas'],
                    'role' => 'siswa',
                    'password' => Hash::make($item['password']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
            DB::table('users')->insert($dataToInsert);
        }

        $this->command->info("Impor data siswa selesai!");
    }
}
