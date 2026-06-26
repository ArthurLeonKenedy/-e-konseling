<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('laporan_siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('guru_id')->constrained('users')->onDelete('cascade');
            $table->string('judul');
            $table->string('kategori'); // Akademik, Perilaku, Kehadiran, Bullying, Narkoba, Lainnya
            $table->text('deskripsi');
            $table->date('tanggal_kejadian');
            $table->string('tingkat_keparahan')->default('Ringan'); // Ringan, Sedang, Berat
            $table->string('status')->default('Dalam Proses'); // Dalam Proses, Ditangani, Selesai
            $table->text('tindakan')->nullable(); // Tindakan yang diambil guru
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('laporan_siswa');
    }
};
