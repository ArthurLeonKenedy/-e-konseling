<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$konselings = \Illuminate\Support\Facades\DB::table('konselings')->count();
$messages = \Illuminate\Support\Facades\DB::table('messages')->count();

echo "Konseling count: " . $konselings . "\n";
echo "Messages count: " . $messages . "\n";
