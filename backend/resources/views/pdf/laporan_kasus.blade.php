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
        <h2>LAPORAN BIMBINGAN DAN KONSELING</h2>
        <p style="font-size: 11px;">ID Laporan: #{{ $laporan->id }} | Tanggal Cetak: {{ date('d/m/Y') }}</p>
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
            <tr>
                <td>Status Saat Ini</td>
                <td>: {{ $laporan->status }}</td>
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
        <table>
            <tr>
                <td style="width: 60%;"></td>
                <td style="text-align: center;">
                    <p>Pontianak, {{ date('d F Y') }}</p>
                    <p>Guru Pembimbing (BK),</p>
                    <div class="signature-space"></div>
                    <p class="name">{{ $laporan->guru->name }}</p>
                    <p>NIP. ..................................</p>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
