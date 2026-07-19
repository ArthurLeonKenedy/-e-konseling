<!DOCTYPE html>
<html>
<head>
    <title>Laporan Konseling - SMKN 1 Pontianak</title>
    <style>
        body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; margin: 0; padding: 20px; }
        .header { text-align: center; border-bottom: 3px double #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 22px; text-transform: uppercase; }
        .header p { margin: 5px 0; font-size: 12px; font-weight: bold; }
        .title { text-align: center; margin-bottom: 30px; }
        .title h2 { text-decoration: underline; font-size: 18px; margin: 0; }
        .content { margin-bottom: 20px; }
        .section-title { font-weight: bold; background: #f0f0f0; padding: 8px; margin-top: 15px; border-radius: 4px; font-size: 14px; }
        .details-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .details-table td { padding: 8px; vertical-align: top; border-bottom: 1px solid #eee; font-size: 13px; }
        .details-table td:first-child { width: 30%; font-weight: bold; color: #555; }
        .description-box { border: 1px solid #ccc; padding: 15px; margin-top: 10px; font-size: 13px; line-height: 1.6; min-height: 100px; }
        .footer { margin-top: 50px; }
        .footer table { width: 100%; }
        .footer .signature-space { height: 80px; }
        .footer .name { font-weight: bold; text-decoration: underline; }
        @page { margin: 1cm; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SMK NEGERI 1 PONTIANAK</h1>
        <p>Jl. Danau Sentarum, Pontianak Kota, Kota Pontianak, Kalimantan Barat</p>
        <p>Email: info@smkn1pontianak.sch.id | Telp: (0561) 123456</p>
    </div>

    <div class="title">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=80x80&data={{ urlencode('https://ekonseling.smkn1pontianak.sch.id/verify/' . $laporan->id) }}" style="width: 80px; height: 80px; float: right; margin-top: -20px; border: 1px solid #ccc; padding: 2px;" alt="QR Verification" />
        <h2>LAPORAN BIMBINGAN DAN KONSELING</h2>
        <p style="font-size: 11px; font-weight: bold; margin-top: 5px; color: #111;">Nomor Dokumen: DOC/BK/SMKN1/{{ date('Y') }}/{{ str_pad($laporan->id, 6, '0', STR_PAD_LEFT) }}</p>
        <p style="font-size: 11px; margin-top: 2px; color: #555;">Tanggal Cetak: {{ date('d/m/Y') }} | Status: {{ $laporan->status }}</p>
    </div>

    <div class="content">
        <div class="section-title">A. IDENTITAS SISWA</div>
        <table class="details-table">
            <tr>
                <td>Nama Lengkap</td>
                <td>: {{ $laporan->siswa->name }}</td>
            </tr>
            <tr>
                <td>Kelas / Rombel</td>
                <td>: {{ $laporan->siswa->kelas }}</td>
            </tr>
            <tr>
                <td>NISN</td>
                <td>: {{ $laporan->siswa->nisn ?? '-' }}</td>
            </tr>
        </table>

        <div class="section-title">B. INFORMASI KEJADIAN / KELUHAN</div>
        <table class="details-table">
            <tr>
                <td>Judul Laporan</td>
                <td>: {{ $laporan->judul }}</td>
            </tr>
            <tr>
                <td>Kategori</td>
                <td>: {{ $laporan->kategori }}</td>
            </tr>
            <tr>
                <td>Tanggal Kejadian</td>
                <td>: {{ $laporan->tanggal_kejadian }}</td>
            </tr>
            <tr>
                <td>Tingkat Keparahan</td>
                <td>: {{ $laporan->tingkat_keparahan }}</td>
            </tr>
        </table>

        <div class="section-title">C. URAIAN MASALAH</div>
        <div class="description-box">
            {{ $laporan->deskripsi }}
        </div>

        <div class="section-title">D. TINDAKAN GURU BK</div>
        <div class="description-box">
            {{ $laporan->tindakan ?? 'Belum ada tindakan yang dicatat.' }}
        </div>
    </div>

    <div class="footer">
        <table style="width: 100%; border-collapse: collapse; border: none; margin-top: 40px;">
            <tr style="border: none;">
                <td style="width: 33%; text-align: center; border: none; font-size: 12px; vertical-align: top; padding: 0;">
                    <p>Mengetahui,</p>
                    <p style="font-weight: bold; margin-top: 2px;">Orang Tua / Wali Siswa,</p>
                    <div style="height: 65px;"></div>
                    <p class="name">( ....................................... )</p>
                    <p style="color: #666; font-size: 10px; margin-top: 4px;">Wali dari {{ $laporan->siswa->name }}</p>
                </td>
                <td style="width: 34%; text-align: center; border: none; font-size: 12px; vertical-align: top; padding: 0;">
                    <p>Pontianak, {{ date('d F Y') }}</p>
                    <p style="font-weight: bold; margin-top: 2px;">Guru Bimbingan Konseling (BK),</p>
                    <div style="height: 65px;"></div>
                    <p class="name">{{ $laporan->guru->name }}</p>
                    <p style="color: #666; font-size: 10px; margin-top: 4px;">NIP. {{ $laporan->guru->nip ?? '..................................' }}</p>
                </td>
                <td style="width: 33%; text-align: center; border: none; font-size: 12px; vertical-align: top; padding: 0;">
                    <p>Menyetujui,</p>
                    <p style="font-weight: bold; margin-top: 2px;">Kepala Sekolah SMKN 1,</p>
                    <div style="height: 65px;"></div>
                    <p class="name">Drs. H. Wardah, M.Pd.</p>
                    <p style="color: #666; font-size: 10px; margin-top: 4px;">NIP. 196803121995121002</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
