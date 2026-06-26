<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Hanya origin yang terdaftar di CORS_ALLOWED_ORIGINS (file .env) yang
    | diizinkan mengakses API ini. Pisahkan beberapa origin dengan koma.
    |
    | Contoh .env:
    |   CORS_ALLOWED_ORIGINS=http://localhost:3000,https://ekonseling.smkn1pontianak.sch.id
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_map(
        'trim',
        explode(',', env('CORS_ALLOWED_ORIGINS', 'http://localhost:3000'))
    ),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],

    'exposed_headers' => [],

    'max_age' => 86400,

    'supports_credentials' => false,

];
