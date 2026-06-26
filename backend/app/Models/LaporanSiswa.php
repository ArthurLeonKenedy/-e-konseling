<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanSiswa extends Model
{
    protected $table = 'laporan_siswa';

    protected $fillable = [
        'siswa_id',
        'guru_id',
        'judul',
        'kategori',
        'deskripsi',
        'tanggal_kejadian',
        'tingkat_keparahan',
        'status',
        'tindakan',
    ];

    protected $casts = [
        'deskripsi' => 'encrypted',
        'tindakan' => 'encrypted',
    ];

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function guru()
    {
        return $this->belongsTo(User::class, 'guru_id');
    }
}
