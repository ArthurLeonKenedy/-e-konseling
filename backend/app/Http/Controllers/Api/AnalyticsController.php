<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\LaporanSiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    /**
     * AI Advisor: Mendeteksi tren masalah berdasarkan data teks terenkripsi.
     * Logika: Mendekripsi data secara on-the-fly, mendeteksi keyword, dan memberikan saran.
     */
    public function getAdvisorAdvice()
    {
        try {
            // 1. Ambil data pesan 7 hari terakhir
            $messages = Message::where('created_at', '>=', now()->subDays(7))->get();
            // 2. Ambil data laporan 30 hari terakhir
            $laporan = LaporanSiswa::where('created_at', '>=', now()->subDays(30))->get();

            $analysis = [
                'bullying' => 0,
                'akademik' => 0,
                'mental_health' => 0,
                'keluarga' => 0,
                'total_scanned' => $messages->count() + $laporan->count()
            ];

            // Keywords sederhana (bisa dikembangkan)
            $dictionary = [
                'bullying' => ['bully', 'pukul', 'ancam', 'palak', 'ejek', 'hina', 'rusak', 'keroyok'],
                'akademik' => ['nilai', 'ujian', 'tugas', ' remedial', 'lulus', 'malas', 'bolos', 'telat'],
                'mental_health' => ['sedih', 'stres', 'stress', 'depresi', 'bunuh diri', 'menangis', 'sendiri', 'takut', 'cemas'],
                'keluarga' => ['orang tua', 'ayah', 'ibu', 'mama', 'papa', 'cerai', 'rumah', 'berantem'],
            ];

            // Analisis Pesan
            foreach ($messages as $msg) {
                $text = strtolower($msg->message);
                foreach ($dictionary as $category => $keywords) {
                    foreach ($keywords as $word) {
                        if (str_contains($text, $word)) {
                            $analysis[$category]++;
                        }
                    }
                }
            }

            // Analisis Laporan
            foreach ($laporan as $lap) {
                $text = strtolower($lap->deskripsi . ' ' . $lap->judul);
                foreach ($dictionary as $category => $keywords) {
                    foreach ($keywords as $word) {
                        if (str_contains($text, $word)) {
                            $analysis[$category]++;
                        }
                    }
                }
            }

            // Generate "Advice" (Saran)
            $advices = [];
            $maxCategory = collect($analysis)->except('total_scanned')->sortDesc()->firstKey();
            $maxValue = $analysis[$maxCategory] ?? 0;

            if ($maxValue > 5) {
                if ($maxCategory === 'bullying') {
                    $advices[] = [
                        'level' => 'warning',
                        'title' => 'Deteksi Tren Perundungan',
                        'message' => 'Terdapat peningkatan kata kunci terkait perundungan dalam 7 hari terakhir. Disarankan untuk melakukan sosialisasi anti-bullying di kelas terkait.'
                    ];
                } elseif ($maxCategory === 'mental_health') {
                    $advices[] = [
                        'level' => 'danger',
                        'title' => 'Waspada Kesehatan Mental',
                        'message' => 'Banyak siswa mengungkapkan perasaan cemas atau sedih. Pertimbangkan untuk mengadakan sesi konseling kelompok atau relaksasi.'
                    ];
                } elseif ($maxCategory === 'akademik') {
                    $advices[] = [
                        'level' => 'info',
                        'title' => 'Tekanan Akademik Terdeteksi',
                        'message' => 'Tren menunjukkan kecemasan terkait nilai dan tugas. Guru BK dapat berkoordinasi dengan kurikulum untuk memantau beban belajar siswa.'
                    ];
                }
            } else {
                $advices[] = [
                    'level' => 'success',
                    'title' => 'Situasi Kondusif',
                    'message' => 'Tidak terdeteksi pola masalah yang menonjol. Tetap lakukan pemantauan rutin untuk menjaga iklim positif sekolah.'
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'analysis' => $analysis,
                    'advices' => $advices,
                    'timestamp' => now()->toIso8601String()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
