<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Add kuota_harian to schedules
if (!Schema::hasColumn('schedules', 'kuota_harian')) {
    Schema::table('schedules', function (Blueprint $table) {
        $table->integer('kuota_harian')->default(3)->after('status');
    });
    echo "Added kuota_harian to schedules\n";
}

// Add usulan_tanggal, usulan_waktu to konselings
if (!Schema::hasColumn('konselings', 'usulan_tanggal')) {
    Schema::table('konselings', function (Blueprint $table) {
        $table->date('usulan_tanggal')->nullable()->after('waktu');
        $table->time('usulan_waktu')->nullable()->after('usulan_tanggal');
    });
    echo "Added usulan_tanggal, usulan_waktu to konselings\n";
}

echo "Migration completed.\n";
