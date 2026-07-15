"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "../../../lib/apiFetch";

export default function SearchParamsWrapper() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    if (!storedUser) {
      router.push('/');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/');
      return;
    }
    setUser(parsedUser);
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
        setShowModal(false);
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

  const handleEdit = (u) => {
    setEditingUser(u);
    setFormData({
      name: u.name,
      password: "", // Leave blank for edit unless changing
      role: u.role,
      kelas: u.kelas || "",
      nisn: u.nisn || "",
      nip: u.nip || ""
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

  const handleLogout = async () => {
    try { await apiFetch('/api/logout', { method: 'POST' }); } catch (e) {}
    localStorage.clear();
    router.replace('/');
  };

  return (
    <div className="dash-layout text-slate-200">
      <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      {/* Sidebar Admin */}
      <aside className={`dash-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="dash-sidebar-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-emerald-950/20">A</div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white">Portal Admin</h1>
              <p className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase mt-0.5">E-Konseling v3</p>
            </div>
          </div>
        </div>

        <nav className="dash-sidebar-nav">
          <AdminNavLink active={false} icon={<GridIcon />} label="Dashboard Ringkasan" href="/admin" />
          <AdminNavLink active={roleFilter === 'guru'} icon={<GuruIcon />} label="Kelola Guru BK" href="/admin/users?role=guru" />
          <AdminNavLink active={roleFilter === 'siswa'} icon={<SiswaIcon />} label="Kelola Data Siswa" href="/admin/users?role=siswa" />
          <AdminNavLink active={false} icon={<FileIcon />} label="Laporan Kasus" href="/admin/reports" />
        </nav>

        <div className="p-6 border-t border-slate-800/50">
           <button onClick={handleLogout} className="dash-nav-item hover:text-red-400 w-full justify-start text-slate-400">
              <LogoutIcon /> Keluar Sesi
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dash-content">
        <div className="mobile-topbar">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-lg">A</div>
             <span className="font-extrabold text-white">Portal Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-400 hover:text-white focus:outline-none">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <div className="max-w-7xl mx-auto space-y-8 animate-slide-up mt-4 lg:mt-0">
          
          {/* Header Banner - Green gradient with system online pill */}
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center font-black text-2xl text-emerald-800 border border-emerald-500/30">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight">Halo, {user?.name || 'Administrator'}</h1>
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest mt-0.5">DASHBOARD PORTAL ADMIN</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-4 py-2 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-emerald-300">SISTEM ONLINE</span>
            </div>
          </div>

          {/* Database Card */}
          <section className="dash-card overflow-hidden !mb-0">
            <div className="px-8 py-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100">
                  {roleFilter === 'guru' ? 'Basis Data Guru BK' : 'Database Peserta Didik'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Total terverifikasi: {users.length} {roleFilter === 'guru' ? 'guru' : 'siswa'}
                </p>
              </div>
              
              <button 
                onClick={() => { 
                  setEditingUser(null); 
                  setFormData({ name: "", password: "", role: roleFilter, kelas: "", nisn: "", nip: "" }); 
                  setShowModal(true); 
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-900/20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                TAMBAH DATA
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>{roleFilter === 'guru' ? 'Nama Guru BK' : 'Nama Siswa'}</th>
                    <th>Identitas</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-slate-400 font-medium">Memuat data...</td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center py-12 text-slate-500 font-medium">Belum ada data {roleFilter === 'guru' ? 'guru' : 'siswa'}.</td>
                    </tr>
                  ) : users.map((u) => (
                    <tr key={u.id} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-slate-800 text-sm uppercase shadow-sm">
                            {u.name.substring(0, 2)}
                          </div>
                          <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{u.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-success text-[10px] uppercase font-bold tracking-wider">
                            {roleFilter === 'guru' ? 'GURU BK' : u.kelas}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {roleFilter === 'guru' ? `NIP: ${u.nip || '-'}` : `NISN: ${u.nisn || '-'}`}
                          </span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-4">
                          <button 
                            onClick={() => handleEdit(u)} 
                            className="text-xs font-bold text-emerald-400 hover:underline hover:text-emerald-300 transition-colors"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(u.id)} 
                            className="text-xs font-bold text-rose-400 hover:underline hover:text-rose-300 transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>

      {/* Modal - Redesigned in Premium Dark Theme */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleIn">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500"></div>
            
            <div className="p-8 border-b border-slate-800/80 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">
                {editingUser ? 'Edit' : 'Tambah'} {roleFilter === 'guru' ? 'Guru' : 'Siswa'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5" autoComplete="off">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium text-slate-200"
                  placeholder="Masukkan nama lengkap..."
                  autoComplete="off"
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
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium text-slate-200"
                      placeholder="XII TKJ 1"
                      autoComplete="off"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">NISN</label>
                    <input
                      type="text"
                      required={!editingUser}
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium text-slate-200"
                      placeholder="10 digit angka"
                      autoComplete="off"
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
                    className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium text-slate-200"
                    placeholder="Masukkan NIP resmi..."
                    autoComplete="off"
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
                  className="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-sm font-medium text-slate-200"
                  placeholder={editingUser ? "Kosongkan jika tidak diubah" : "Minimal 6 karakter..."}
                  autoComplete="new-password"
                />
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-950/30 hover:scale-[0.98] transition-all duration-200">
                  {editingUser ? 'Simpan Perubahan' : 'Daftarkan Sekarang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminNavLink({ active, icon, label, href }) {
  return (
    <a href={href} className={`dash-nav-item ${active ? 'active' : ''}`}>
       {icon}
       <span>{label}</span>
    </a>
  );
}

// Icons for Sidebar Nav
const GridIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const GuruIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const SiswaIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
const FileIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>;
