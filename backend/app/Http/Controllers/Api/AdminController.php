<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function getUsers(Request $request)
    {
        $role = $request->query('role');
        $users = User::when($role, function($query) use ($role) {
            return $query->where('role', $role);
        })->orderBy('name', 'asc')->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:siswa,guru,admin',
            'password' => 'required|string|min:6',
            'kelas' => 'nullable|string',
            'nisn' => 'nullable|string',
            'nip' => 'nullable|string|unique:users,nip',
        ]);

        $user = User::create([
            'name' => $request->name,
            'role' => $request->role,
            'password' => Hash::make($request->password),
            'kelas' => $request->kelas,
            'nisn' => $request->nisn,
            'nip' => $request->nip,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil ditambahkan',
            'data' => $user
        ]);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|in:siswa,guru,admin',
            'kelas' => 'nullable|string',
            'nisn' => 'nullable|string',
            'nip' => 'nullable|string|unique:users,nip,' . $id,
        ]);

        $user->name = $request->name;
        $user->role = $request->role;
        $user->kelas = $request->kelas;
        $user->nisn = $request->nisn;
        $user->nip = $request->nip;

        if ($request->password) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'User berhasil diperbarui',
            'data' => $user
        ]);
    }

    public function deleteUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        // Prevent deleting self
        if ($request->user() && $request->user()->id == $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri.'
            ], 403);
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($user) {
            // Delete related chats
            \App\Models\Chat::where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id)
                ->delete();

            // Delete related schedules
            \Illuminate\Support\Facades\DB::table('schedules')->where('guru_id', $user->id)->delete();

            // Delete related konselings
            \App\Models\Konseling::where('siswa_id', $user->id)
                ->orWhere('guru_id', $user->id)
                ->delete();

            // Finally, delete the user
            $user->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'User beserta seluruh datanya berhasil dihapus'
        ]);
    }

    public function getStats()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'total_siswa' => User::where('role', 'siswa')->count(),
                'total_guru' => User::where('role', 'guru')->count(),
                'total_admin' => User::where('role', 'admin')->count(),
                'total_kasus' => \App\Models\LaporanSiswa::count(),
            ]
        ]);
    }
}
