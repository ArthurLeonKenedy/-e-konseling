<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LaporanSiswa;
use App\Models\User;
use Illuminate\Http\Request;

class LaporanController extends Controller
{
    // Ambil semua laporan milik guru tertentu
    public function index(Request $request)
    {
        try {
            $query = LaporanSiswa::with(['siswa', 'guru']);

            if ($request->has('guru_id')) {
                $query->where('guru_id', $request->guru_id);
            }
            if ($request->has('siswa_id')) {
                $query->where('siswa_id', $request->siswa_id);
            }

            $laporan = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $laporan->map(function ($l) {
                    return [
                        'id'                => $l->id,
                        'judul'             => $l->judul,
                        'kategori'          => $l->kategori,
                        'deskripsi'         => $l->deskripsi,
                        'tanggal_kejadian'  => $l->tanggal_kejadian,
                        'tingkat_keparahan' => $l->tingkat_keparahan,
                        'status'            => $l->status,
                        'tindakan'          => $l->tindakan,
                        'created_at'        => $l->created_at->format('Y-m-d'),
                        'siswa' => [
                            'id'    => $l->siswa->id ?? null,
                            'name'  => $l->siswa->name ?? 'Siswa Terhapus',
                            'kelas' => $l->siswa->kelas ?? '-',
                        ],
                        'guru' => [
                            'id'   => $l->guru->id ?? null,
                            'name' => $l->guru->name ?? 'Guru Terhapus',
                        ],
                    ];
                })
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Buat laporan baru
    public function store(Request $request)
    {
        try {
            $laporan = LaporanSiswa::create([
                'siswa_id'          => $request->siswa_id,
                'guru_id'           => $request->guru_id,
                'judul'             => $request->judul,
                'kategori'          => $request->kategori,
                'deskripsi'         => $request->deskripsi,
                'tanggal_kejadian'  => $request->tanggal_kejadian,
                'tingkat_keparahan' => $request->tingkat_keparahan ?? 'Ringan',
                'status'            => 'Dalam Proses',
                'tindakan'          => $request->tindakan,
            ]);

            $laporan->load(['siswa', 'guru']);

            return response()->json(['success' => true, 'data' => $laporan, 'message' => 'Laporan berhasil dibuat.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Update status laporan
    public function updateStatus(Request $request, $id)
    {
        try {
            $laporan = LaporanSiswa::findOrFail($id);
            $laporan->status   = $request->status ?? $laporan->status;
            $laporan->tindakan = $request->tindakan ?? $laporan->tindakan;
            $laporan->save();

            return response()->json(['success' => true, 'message' => 'Status laporan diperbarui.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Hapus laporan
    public function destroy($id)
    {
        try {
            LaporanSiswa::findOrFail($id)->delete();
            return response()->json(['success' => true, 'message' => 'Laporan dihapus.']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
