<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SuratPanggilan;
use Illuminate\Http\Request;

class SuratPanggilanController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            $query = SuratPanggilan::with(['siswa', 'guru']);

            if ($user->role === 'siswa') {
                $query->where('siswa_id', $user->id);
            } elseif ($user->role === 'guru') {
                $query->where('guru_id', $user->id);
            }

            $surat = $query->orderBy('tanggal_panggilan', 'desc')
                           ->orderBy('waktu_panggilan', 'desc')
                           ->get();

            return response()->json([
                'success' => true,
                'data' => $surat
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $user = $request->user();
            if ($user->role !== 'guru') {
                return response()->json(['success' => false, 'message' => 'Hanya Guru BK yang dapat membuat surat panggilan.'], 403);
            }

            $request->validate([
                'siswa_id' => 'required|exists:users,id',
                'nomor_surat' => 'required|string',
                'tanggal_panggilan' => 'required|date',
                'waktu_panggilan' => 'required',
                'alasan' => 'required|string',
            ]);

            $surat = SuratPanggilan::create([
                'guru_id' => $user->id,
                'siswa_id' => $request->siswa_id,
                'nomor_surat' => $request->nomor_surat,
                'tanggal_panggilan' => $request->tanggal_panggilan,
                'waktu_panggilan' => $request->waktu_panggilan,
                'alasan' => $request->alasan,
                'status' => 'Menunggu',
            ]);

            $surat->load(['siswa', 'guru']);

            return response()->json([
                'success' => true,
                'data' => $surat,
                'message' => 'Surat panggilan berhasil dibuat.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $user = $request->user();
            if ($user->role !== 'guru') {
                return response()->json(['success' => false, 'message' => 'Hanya Guru BK yang dapat mengubah status panggilan.'], 403);
            }

            $request->validate([
                'status' => 'required|in:Menunggu,Selesai,Batal',
            ]);

            $surat = SuratPanggilan::findOrFail($id);
            $surat->status = $request->status;
            $surat->save();

            return response()->json([
                'success' => true,
                'data' => $surat,
                'message' => 'Status surat panggilan berhasil diperbarui.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();
            if ($user->role !== 'guru') {
                return response()->json(['success' => false, 'message' => 'Hanya Guru BK yang dapat menghapus surat panggilan.'], 403);
            }

            $surat = SuratPanggilan::findOrFail($id);
            $surat->delete();

            return response()->json([
                'success' => true,
                'message' => 'Surat panggilan berhasil dihapus.'
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
