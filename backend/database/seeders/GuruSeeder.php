<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class GuruSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gurus = [
            'ELDATINA S.Pd',
            'SUSIYATUN S.Pd',
            'DALINA S.Pd',
            'RENI JULIANTI S.Pd',
        ];

        $hariKerja = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

        foreach ($gurus as $nama) {
            // Insert Guru ke tabel users
            $guruId = \Illuminate\Support\Facades\DB::table('users')->insertGetId([
                'name' => $nama,
                'role' => 'guru',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Insert Jadwal untuk setiap hari kerja
            foreach ($hariKerja as $hari) {
                \Illuminate\Support\Facades\DB::table('schedules')->insert([
                    'guru_id' => $guruId,
                    'hari' => $hari,
                    'jam_mulai' => '07:30',
                    'jam_selesai' => '15:30',
                    'status' => 'Tersedia',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
