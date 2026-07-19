<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Konseling;
use App\Models\User;

class KonselingController extends Controller
{
    /**
     * Store a new konseling request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:users,id',
            'guru_id' => 'nullable|exists:users,id',
            'guru_name' => 'required_without:guru_id',
            'tanggal' => 'required|date',
            'waktu' => 'required',
            'topik' => 'required',
        ]);

        $guru = null;
        if ($request->has('guru_id')) {
            $guru = User::where('id', $request->guru_id)->where('role', 'guru')->first();
        }

        if (!$guru && $request->has('guru_name')) {
            // Find guru_id by name (case-insensitive)
            $guru = User::whereRaw('LOWER(name) = ?', [trim(strtolower($request->guru_name))])
                ->where('role', 'guru')
                ->first();
        }

        if (!$guru) {
            return response()->json([
                'success' => false,
                'message' => 'Guru tidak ditemukan.'
            ], 404);
        }

        // Defensive check: Ensure siswa is a student and not the same as the guru
        $siswa = User::find($request->siswa_id);
        if (!$siswa || trim(strtolower($siswa->role)) !== 'siswa') {
            return response()->json([
                'success' => false,
                'message' => 'Pendaftar harus berstatus siswa. Role saat ini: ' . ($siswa ? $siswa->role : 'null') . ' (ID: ' . $request->siswa_id . ')'
            ], 400);
        }

        if ($request->siswa_id == $guru->id) {
            return response()->json([
                'success' => false,
                'message' => 'Guru tidak dapat mendaftar untuk diri sendiri.'
            ], 400);
        }

        // --- CHECK QUOTA ---
        $schedule = \Illuminate\Support\Facades\DB::table('schedules')->where('guru_id', $guru->id)->first();
        $kuotaHarian = $schedule ? $schedule->kuota_harian : 3;

        $activeBookingsCount = Konseling::where('guru_id', $guru->id)
            ->where('tanggal', $request->tanggal)
            ->whereIn('status', ['Menunggu Konfirmasi', 'Terjadwal', 'Sedang Konseling'])
            ->count();

        if ($activeBookingsCount >= $kuotaHarian) {
            return response()->json([
                'success' => false,
                'message' => "Kuota harian guru ini ({$kuotaHarian} siswa) untuk tanggal tersebut sudah penuh. Silakan pilih tanggal lain."
            ], 400);
        }
        // --- END CHECK QUOTA ---

        // Check for existing booking at the same time for this student
        $exists = Konseling::where('siswa_id', $request->siswa_id)
            ->where('tanggal', $request->tanggal)
            ->where('waktu', $request->waktu)
            ->whereIn('status', ['Menunggu Konfirmasi', 'Terjadwal', 'Sedang Konseling'])
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Anda sudah memiliki jadwal bimbingan di waktu yang sama.'
            ], 400);
        }

        $konseling = Konseling::create([
            'siswa_id' => $request->siswa_id,
            'guru_id' => $guru->id,
            'tanggal' => $request->tanggal,
            'waktu' => $request->waktu,
            'topik' => $request->topik,
            'status' => 'Menunggu Konfirmasi'
        ]);

        // Load relations for notification details
        $konseling->load(['siswa', 'guru']);

        // Dispatch WebPush notification to Guru
        try {
            $guru->notify(new \App\Notifications\NewBookingNotification($konseling));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Failed to notify guru: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Permintaan konseling berhasil dikirim!',
            'data' => $konseling
        ]);
    }

    /**
     * Get list of konseling requests for a teacher or student.
     */
    public function index(Request $request)
    {
        $query = Konseling::with(['siswa', 'guru']);

        if ($request->has('guru_id')) {
            $query->where('guru_id', $request->guru_id);
        }

        if ($request->has('siswa_id')) {
            $query->where('siswa_id', $request->siswa_id);
        }

        $konselings = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $konselings
        ]);
    }

    /**
     * Update the status of a konseling request.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string'
        ]);

        $konseling = Konseling::findOrFail($id);
        $konseling->status = $request->status;
        $konseling->save();

        return response()->json([
            'success' => true,
            'message' => 'Status berhasil diperbarui!',
            'data' => $konseling
        ]);
    }

    /**
     * Delete/Cancel a konseling request.
     */
    public function destroy($id)
    {
        $konseling = Konseling::findOrFail($id);
        $konseling->delete();

        return response()->json([
            'success' => true,
            'message' => 'Konseling berhasil dibatalkan.'
        ]);
    }

    /**
     * Guru proposes a new time (Reschedule).
     */
    public function proposeReschedule(Request $request, $id)
    {
        $request->validate([
            'usulan_tanggal' => 'required|date',
            'usulan_waktu' => 'required'
        ]);

        $konseling = Konseling::findOrFail($id);
        $konseling->usulan_tanggal = $request->usulan_tanggal;
        $konseling->usulan_waktu = $request->usulan_waktu;
        $konseling->status = 'Usulan Reschedule';
        $konseling->save();

        return response()->json([
            'success' => true,
            'message' => 'Usulan jadwal baru telah dikirim ke siswa.',
            'data' => $konseling
        ]);
    }

    /**
     * Siswa accepts the reschedule.
     */
    public function acceptReschedule($id)
    {
        $konseling = Konseling::findOrFail($id);
        
        // Apply the proposed time
        $konseling->tanggal = $konseling->usulan_tanggal;
        $konseling->waktu = $konseling->usulan_waktu;
        
        // Clear proposals and set to scheduled
        $konseling->usulan_tanggal = null;
        $konseling->usulan_waktu = null;
        $konseling->status = 'Terjadwal';
        $konseling->save();

        return response()->json([
            'success' => true,
            'message' => 'Jadwal baru disetujui.',
            'data' => $konseling
        ]);
    }
}
