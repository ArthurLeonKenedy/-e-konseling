"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/apiFetch";

export default function SearchParamsWrapper() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    role: "siswa",
    kelas: "",
    nisn: "",
    nip: ""
  });
  
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get('role') || 'siswa';
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || JSON.parse(storedUser).role !== 'admin') {
      router.push('/');
      return;
    }
    fetchUsers();
    setFormData((prev) => ({ ...prev, role: roleFilter }));
  }, [roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/admin/users?role=${roleFilter}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingUser 
      ? `/api/admin/users/${editingUser.id}` 
      : `/api/admin/users`;
    const method = editingUser ? "PUT" : "POST";

    try {
      const response = await apiFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        setEditingUser(null);
        setFormData({ name: "", password: "", role: roleFilter, kelas: "", nisn: "", nip: "" });
        fetchUsers();
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      password: "", // Leave blank for edit unless changing
      role: user.role,
      kelas: user.kelas || "",
      nisn: user.nisn || "",
      nip: user.nip || ""
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Yakin ingin menghapus pengguna ini?")) return;
    try {
      const response = await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchUsers();
      }
    } catch (error) {
      alert("Gagal menghapus.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white rounded-2xl p-6 shadow-md mb-8 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')} 
              className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl transition-all border border-white/15 shadow-sm"
              title="Kembali ke Dashboard"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="h-8 w-px bg-white/20 hidden md:block"></div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Kelola {roleFilter === 'guru' ? 'Guru BK' : 'Siswa'}</h1>
              <p className="text-xs text-emerald-100/80 font-medium mt-0.5">Manajemen Pengguna Terdaftar</p>
            </div>
          </div>
          
          <button 
            onClick={() => { setEditingUser(null); setFormData({ name: "", password: "", role: roleFilter, kelas: "", nisn: "", nip: "" }); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 hover:bg-emerald-50 active:scale-95 rounded-xl text-xs font-bold transition-all shadow-sm self-start md:self-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            TAMBAH DATA
          </button>
        </div>

        {/* Table/Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="pl-8 pr-6 py-5 font-extrabold text-[11px]">Nama Lengkap</th>
                  {roleFilter === 'siswa' && <th className="px-6 py-5 font-extrabold text-[11px]">Kelas</th>}
                  {roleFilter === 'siswa' && <th className="px-6 py-5 font-extrabold text-[11px]">NISN</th>}
                  {roleFilter === 'guru' && <th className="px-6 py-5 font-extrabold text-[11px]">NIP / Kode Unik</th>}
                  <th className="px-6 py-5 font-extrabold text-[11px] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-medium">Memuat data...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Belum ada data {roleFilter}.</td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-emerald-50/50 transition-colors">
                    <td className="pl-8 pr-6 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-white text-[15px] uppercase shadow-md shadow-emerald-200/50 ring-2 ring-white">
                          {u.name.substring(0, 2)}
                        </div>
                        <span className="font-extrabold text-slate-900 text-base whitespace-nowrap">{u.name}</span>
                      </div>
                    </td>
                    {roleFilter === 'siswa' && <td className="px-6 py-5 text-slate-600 font-medium">{u.kelas}</td>}
                    {roleFilter === 'siswa' && <td className="px-6 py-5 text-slate-600 font-medium">{u.nisn}</td>}
                    {roleFilter === 'guru' && <td className="px-6 py-5 text-slate-600 font-medium">{u.nip}</td>}
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleEdit(u)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2-2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
            <div className="relative w-full max-w-lg dash-card rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">{editingUser ? 'Edit' : 'Tambah'} {roleFilter === 'guru' ? 'Guru' : 'Siswa'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none text-sm font-medium"
                    placeholder="Masukkan nama lengkap..."
                  />
                </div>
                
                {roleFilter === 'siswa' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kelas</label>
                      <input
                        type="text"
                        required={!editingUser}
                        value={formData.kelas}
                        onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none text-sm font-medium"
                        placeholder="XII TKJ 1"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NISN</label>
                      <input
                        type="text"
                        required={!editingUser}
                        value={formData.nisn}
                        onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none text-sm font-medium"
                        placeholder="10 digit angka"
                      />
                    </div>
                  </div>
                )}
                {roleFilter === 'guru' && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NIP (Nomor Induk Pegawai)</label>
                    <input
                      type="text"
                      required={!editingUser}
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none text-sm font-medium"
                      placeholder="Masukkan NIP resmi..."
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 transition-all outline-none text-sm font-medium"
                    placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter..."}
                  />
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:scale-[0.98] transition-all">
                    {editingUser ? 'Simpan Perubahan' : 'Daftarkan Sekarang'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
