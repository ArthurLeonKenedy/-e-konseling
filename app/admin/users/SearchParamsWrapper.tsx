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
    <div className="min-h-screen mesh-bg font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div>
            <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
               Kembali ke Dashboard
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Kelola {roleFilter === 'guru' ? 'Guru BK' : 'Siswa'}
            </h1>
            <p className="text-slate-500 font-medium mt-1">Daftar pengguna terdaftar di sistem</p>
          </div>
          <button 
            onClick={() => { setEditingUser(null); setFormData({ name: "", password: "", role: roleFilter, kelas: "", nisn: "", nip: "" }); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
            Tambah {roleFilter === 'guru' ? 'Guru' : 'Siswa'}
          </button>
        </header>

        {/* Table/Content */}
        <div className="dash-card overflow-hidden">
          <div className="dash-table-container">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Nama Lengkap</th>
                  {roleFilter === 'siswa' && <th>Kelas</th>}
                  {roleFilter === 'siswa' && <th>NISN</th>}
                  {roleFilter === 'guru' && <th>NIP / Kode Unik</th>}
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Memuat data...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">Belum ada data {roleFilter}.</td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs uppercase">
                          {u.name.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    {roleFilter === 'siswa' && <td className="px-6 py-5 text-slate-500 font-medium">{u.kelas}</td>}
                    {roleFilter === 'siswa' && <td className="px-6 py-5 text-slate-500 font-medium">{u.nisn}</td>}
                    {roleFilter === 'guru' && <td className="px-6 py-5 text-slate-500 font-medium">{u.nip}</td>}
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
