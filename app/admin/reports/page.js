"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/apiFetch";

export default function LaporanAdmin() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/laporan`);
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'selesai': 
        return <span className="badge badge-success text-[10px] uppercase font-bold tracking-wider">Selesai</span>;
      case 'sedang diproses': 
      case 'dalam proses':
        return <span className="badge badge-warning text-[10px] uppercase font-bold tracking-wider">Dalam Proses</span>;
      default: 
        return <span className="badge badge-neutral text-[10px] uppercase font-bold tracking-wider">{status || 'Pending'}</span>;
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
          <AdminNavLink active={false} icon={<GuruIcon />} label="Kelola Guru BK" href="/admin/users?role=guru" />
          <AdminNavLink active={false} icon={<SiswaIcon />} label="Kelola Data Siswa" href="/admin/users?role=siswa" />
          <AdminNavLink active={true} icon={<FileIcon />} label="Laporan Kasus" href="/admin/reports" />
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
                <h1 className="text-xl md:text-2xl font-black tracking-tight">Monitoring Laporan Kasus</h1>
                <p className="text-xs text-emerald-300 font-bold uppercase tracking-widest mt-0.5">Pantau Kasus yang Ditangani Guru BK</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 px-4 py-2 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-emerald-300">SISTEM AKTIF</span>
            </div>
          </div>

          {/* Laporan List Container */}
          <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
              <div className="text-center py-12 text-slate-400 font-medium">Memuat laporan...</div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-medium">Belum ada laporan kasus yang tercatat.</div>
            ) : reports.map((report) => (
              <div key={report.id} className="dash-card flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-emerald-500/30 transition-all duration-300">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusBadge(report.status)}
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">•</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-bold text-slate-100 mb-1">{report.judul}</h4>
                  <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{report.deskripsi}</p>
                  
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Siswa Terkait</span>
                      <span className="text-sm font-bold text-slate-300">{report.siswa?.name || 'Siswa Umum'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Pelapor (Guru BK)</span>
                      <span className="text-sm font-bold text-slate-300">{report.guru?.name || 'Administrator'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950/60 hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-400 transition-all flex items-center justify-center border border-slate-800/80 shadow-lg cursor-pointer">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
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
