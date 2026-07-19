<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class SuratPanggilan extends Model
{
    use HasFactory;

    protected $table = 'surat_panggilans';

    protected $fillable = [
        'nomor_surat',
        'guru_id',
        'siswa_id',
        'tanggal_panggilan',
        'waktu_panggilan',
        'alasan',
        'status'
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
