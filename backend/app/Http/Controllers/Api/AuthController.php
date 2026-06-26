<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function loginSiswa(Request $request)
    {
        // Validasi input dari React (Next.js)
        $request->validate([
            'name' => 'required',
            'kelas' => 'required',
            'password' => 'required'
        ]);

        // Cari siswa berdasarkan nama dan kelas
        $user = User::whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                    ->where('kelas', $request->kelas)
                    ->where('role', 'siswa')
                    ->first();

        // Jika tidak ketemu atau password salah
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak cocok. Pastikan Nama, Kelas, dan Kata Sandi Anda benar.'
            ], 401);
        }

        // Jika berhasil login — hapus token lama, buat token baru
        $user->tokens()->delete();
        $token = $user->createToken('ekonseling-siswa')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Berhasil masuk!',
            'token'   => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'kelas' => $user->kelas,
                'role' => $user->role
            ]
        ]);
    }

    public function loginGuru(Request $request)
    {
        // Validasi input
        $request->validate([
            'name' => 'required',
            'password' => 'required'
        ]);

        // Cari guru berdasarkan nama
        $user = User::whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                    ->where('role', 'guru')
                    ->first();

        // Jika tidak ketemu atau password salah
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak cocok. Pastikan Nama Lengkap dan Password Anda benar.'
            ], 401);
        }

        // Jika berhasil login — hapus token lama, buat token baru
        $user->tokens()->delete();
        $token = $user->createToken('ekonseling-guru')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Berhasil masuk!',
            'token'   => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role
            ]
        ]);
    }

    public function loginAdmin(Request $request)
    {
        // Validasi input
        $request->validate([
            'name' => 'required',
            'password' => 'required'
        ]);

        // Cari admin berdasarkan nama
        $user = User::whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                    ->where('role', 'admin')
                    ->first();

        // Jika tidak ketemu atau password salah
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Data tidak cocok. Pastikan Nama Admin dan Password Anda benar.'
            ], 401);
        }

        // Jika berhasil login — hapus token lama, buat token baru
        $user->tokens()->delete();
        $token = $user->createToken('ekonseling-admin')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Selamat datang Admin!',
            'token'   => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role
            ]
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'role' => 'required',
            'name' => 'required',
            'new_password' => 'required'
        ]);

        if ($request->role === 'siswa') {
            $request->validate([
                'kelas' => 'required',
                'nisn' => 'required'
            ]);

            $user = User::whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                        ->where('kelas', $request->kelas)
                        ->where('nisn', $request->nisn)
                        ->where('role', 'siswa')
                        ->first();
        } else {
            // Guru wajib verifikasi Nama saja (karena NIP tidak wajib)
            $user = User::whereRaw('LOWER(name) = ?', [strtolower($request->name)])
                        ->where('role', 'guru')
                        ->first();
        }

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Data verifikasi tidak cocok. Silakan periksa kembali data Anda.'
            ], 404);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru.'
        ]);
    }


    public function updateProfile(Request $request)
    {
        try {
            $request->validate([
                'user_id' => 'required',
                'hobi' => 'nullable|string',
                'rencana_masa_depan' => 'nullable|string',
                'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
            ], [
                'photo.image' => 'File harus berupa gambar.',
                'photo.mimes' => 'Format gambar harus jpeg, png, jpg, atau gif.',
                'photo.max' => 'Ukuran gambar maksimal adalah 2MB.'
            ]);

            $user = User::find($request->user_id);
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User tidak ditemukan.'], 404);
            }

            if ($request->hasFile('photo')) {
                // Hapus foto lama jika ada
                if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                    Storage::disk('public')->delete($user->photo);
                }

                $path = $request->file('photo')->store('profiles', 'public');
                $user->photo = $path;
            }

            $user->hobi = $request->hobi;
            $user->rencana_masa_depan = $request->rencana_masa_depan;
            $user->save();

            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diperbarui!',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'kelas' => $user->kelas,
                    'role' => $user->role,
                    'photo' => $user->photo,
                    'hobi' => $user->hobi,
                    'rencana_masa_depan' => $user->rencana_masa_depan
                ]
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal: ' . implode(', ', $e->validator->errors()->all())
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
            ], 500);
        }
    }

    public function getSiswa(Request $request)
    {
        $siswa = User::where('role', 'siswa')
            ->select('id', 'name', 'kelas', 'nisn', 'photo', 'hobi', 'rencana_masa_depan')
            ->orderBy('name', 'asc')
            ->get();
        return response()->json([
            'success' => true,
            'data' => $siswa
        ]);
    }

    public function storeSiswa(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'kelas' => 'required|string|max:50',
            'nisn' => 'required|string|unique:users,nisn',
            'password' => 'required|string|min:8'
        ]);

        $user = User::create([
            'name' => $request->name,
            'kelas' => $request->kelas,
            'nisn' => $request->nisn,
            'role' => 'siswa',
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Siswa berhasil ditambahkan!',
            'data' => $user
        ], 201);
    }
}
