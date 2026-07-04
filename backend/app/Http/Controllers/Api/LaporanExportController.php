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

            $filename = 'Laporan_Konseling_' . ($laporan->siswa->name ?? 'Siswa') . '_' . date('dmY') . '.pdf';

            return $pdf->download($filename);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengekspor PDF: ' . $e->getMessage()
            ], 500);
        }
    }
}
