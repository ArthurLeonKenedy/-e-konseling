<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Konseling extends Model
{
    use HasFactory;

    protected $fillable = [
        'siswa_id',
        'guru_id',
        'tanggal',
        'waktu',
        'topik',
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
