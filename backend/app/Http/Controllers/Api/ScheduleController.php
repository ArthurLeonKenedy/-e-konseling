<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index()
    {
        $gurus = DB::table('users')
            ->where('role', 'guru')
            ->leftJoin('schedules', 'users.id', '=', 'schedules.guru_id')
            ->select(
                'users.id as guru_id',
                'users.name as guru_name',
                'schedules.id as schedule_id',
                'schedules.hari',
                'schedules.jam_mulai',
                'schedules.jam_selesai',
                'schedules.status',
                'schedules.kuota_harian'
            )
            ->get();

        $schedules = $gurus->map(function ($guru) {
            return [
                'id' => $guru->schedule_id,
                'guru_id' => $guru->guru_id,
                'guru_name' => $guru->guru_name,
                'hari' => $guru->hari ?? 'Setiap Hari',
                'jam_mulai' => $guru->jam_mulai ?? '08:00:00',
                'jam_selesai' => $guru->jam_selesai ?? '15:00:00',
                // Always assume 'Tersedia' by default if they haven't explicitly set it to 'Penuh' or 'Sedang Cuti'
                'status' => $guru->status ?? 'Tersedia',
                'kuota_harian' => $guru->kuota_harian ?? 3
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    public function mySchedule(Request $request)
    {
        $guruId = $request->user()->id;
        $schedule = DB::table('schedules')->where('guru_id', $guruId)->first();

        return response()->json([
            'success' => true,
            'data' => $schedule
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'hari' => 'required|string',
            'jam_mulai' => 'required',
            'jam_selesai' => 'required',
            'status' => 'required|in:Tersedia,Sedang Cuti,Penuh',
            'kuota_harian' => 'nullable|integer|min:1'
        ]);

        $guruId = $request->user()->id;

        DB::table('schedules')->updateOrInsert(
            ['guru_id' => $guruId],
            [
                'hari' => $request->hari,
                'jam_mulai' => $request->jam_mulai,
                'jam_selesai' => $request->jam_selesai,
                'status' => $request->status,
                'kuota_harian' => $request->kuota_harian ?? 3,
                'updated_at' => now()
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Jadwal ketersediaan berhasil diperbarui.'
        ]);
    }
}
