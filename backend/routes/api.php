<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\KonselingController;
use App\Http\Controllers\Api\LaporanController;
use App\Http\Controllers\Api\PushSubscriptionController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\SuratPanggilanController;

// ============================================================
// ROUTE PUBLIK — tidak butuh login (token)
// ============================================================
Route::post('/login/siswa',    [AuthController::class, 'loginSiswa'])->middleware('throttle:5,1');
Route::post('/login/guru',     [AuthController::class, 'loginGuru'])->middleware('throttle:5,1');
Route::post('/login/admin',    [AuthController::class, 'loginAdmin'])->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:3,1');

// Jadwal guru tetap publik agar siswa bisa lihat sebelum login
Route::get('/schedules', [ScheduleController::class, 'index']);


// ============================================================
// ROUTE TERPROTEKSI — wajib menyertakan Bearer Token
// ============================================================
Route::middleware('auth:sanctum')->group(function () {

    // Logout — hapus token aktif
    Route::post('/logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Berhasil logout.']);
    });

    // Data pengguna (Sanctum built-in)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Profil lengkap dari database — digunakan frontend untuk re-validasi data
    Route::get('/me', function (Request $request) {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'data' => [
                'id'                 => $user->id,
                'name'               => $user->name,
                'kelas'              => $user->kelas,
                'role'               => $user->role,
                'nisn'               => $user->nisn,
                'nip'                => $user->nip,
                'photo'              => $user->photo,
                'hobi'               => $user->hobi,
                'rencana_masa_depan' => $user->rencana_masa_depan,
            ]
        ]);
    });

    // Update Last Seen
    Route::post('/ping', function (Request $request) {
        $user = $request->user();
        $user->last_seen_at = now();
        $user->save();
        return response()->json(['success' => true]);
    });

    Route::get('/user-status/{id}', function ($id) {
        $user = \App\Models\User::find($id);
        if (!$user) return response()->json(['success' => false], 404);
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'last_seen_at' => $user->last_seen_at
            ]
        ]);
    });

    // Profil & Siswa
    Route::post('/update-profile', [AuthController::class, 'updateProfile']);
    Route::get('/siswa',           [AuthController::class, 'getSiswa']);
    Route::post('/siswa',          [AuthController::class, 'storeSiswa']);

    // Konseling
    Route::get('/konselings',                   [KonselingController::class, 'index']);
    Route::post('/konselings',                  [KonselingController::class, 'store']);
    Route::patch('/konselings/{id}/status',     [KonselingController::class, 'updateStatus']);
    Route::post('/konselings/{id}/reschedule',  [KonselingController::class, 'proposeReschedule']);
    Route::post('/konselings/{id}/accept-reschedule', [KonselingController::class, 'acceptReschedule']);
    Route::delete('/konselings/{id}',           [KonselingController::class, 'destroy']);

    // Jadwal Guru
    Route::get('/schedules/me',                 [ScheduleController::class, 'mySchedule']);
    Route::post('/schedules/update',            [ScheduleController::class, 'update']);

    // Laporan Kasus Siswa
    Route::get('/laporan',              [LaporanController::class, 'index']);
    Route::post('/laporan',             [LaporanController::class, 'store']);
    Route::patch('/laporan/{id}/status',[LaporanController::class, 'updateStatus']);
    Route::delete('/laporan/{id}',      [LaporanController::class, 'destroy']);

    // Admin
    Route::get('/admin/users',        [\App\Http\Controllers\Api\AdminController::class, 'getUsers']);
    Route::post('/admin/users',       [\App\Http\Controllers\Api\AdminController::class, 'storeUser']);
    Route::put('/admin/users/{id}',   [\App\Http\Controllers\Api\AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}',[\App\Http\Controllers\Api\AdminController::class, 'deleteUser']);
    Route::get('/admin/stats',        [\App\Http\Controllers\Api\AdminController::class, 'getStats']);



    // Analitik & Laporan PDF
    Route::get('/analytics/advisor',              [\App\Http\Controllers\Api\AnalyticsController::class, 'getAdvisorAdvice']);
    Route::get('/laporan/{id}/export-pdf',        [\App\Http\Controllers\Api\LaporanExportController::class, 'exportPDF']);

    // Push Notifikasi
    Route::post('/push-subscribe',  [PushSubscriptionController::class, 'subscribe']);
    Route::post('/chats/notify',    [PushSubscriptionController::class, 'notify']);

    // Chat
    Route::get('/chats/unread',        [ChatController::class, 'getUnreadCounts']);
    Route::get('/chats/conversations', [ChatController::class, 'getConversations']);
    Route::get('/chats',               [ChatController::class, 'index']);
    Route::post('/chats',              [ChatController::class, 'store']);
    Route::post('/chats/read',         [ChatController::class, 'markAsRead']);

    // Surat Panggilan
    Route::get('/surat-panggilan',                  [SuratPanggilanController::class, 'index']);
    Route::post('/surat-panggilan',                 [SuratPanggilanController::class, 'store']);
    Route::patch('/surat-panggilan/{id}/status',    [SuratPanggilanController::class, 'updateStatus']);
    Route::delete('/surat-panggilan/{id}',          [SuratPanggilanController::class, 'destroy']);
});
