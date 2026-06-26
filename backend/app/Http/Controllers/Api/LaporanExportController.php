<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LaporanSiswa;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanExportController extends Controller
{
    public function exportPDF($id)
    {
        try {
            $laporan = LaporanSiswa::with(['siswa', 'guru'])->findOrFail($id);

            $pdf = Pdf::loadView('pdf.laporan_kasus', compact('laporan'));

            // Menggunakan stream agar bisa dipreview di browser atau download
            return $pdf->download('Laporan_Konseling_' . $laporan->siswa->name . '_' . date('dmY') . '.pdf');
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor PDF: ' . $e->getMessage()
            ], 500);
        }
    }
}
