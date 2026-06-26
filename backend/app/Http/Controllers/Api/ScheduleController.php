<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index()
    {
        $schedules = DB::table('schedules')
            ->join('users', 'schedules.guru_id', '=', 'users.id')
            ->select('schedules.*', 'users.name as guru_name')
            ->get();

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
