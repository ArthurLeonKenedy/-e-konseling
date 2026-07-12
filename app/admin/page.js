"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/apiFetch";
import AvatarUpload from "../components/AvatarUpload";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_siswa: 0,
    total_guru: 0,
    total_admin: 0,
    total_kasus: 0
  });
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) { router.push('/'); return; }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') { router.push('/'); return; }
    setUser(parsedUser);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await apiFetch(`/api/admin/stats`);
      const data = await response.json();
      if (data.success) setStats(data.data);
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  const handleLogout = async () => {
    try { await apiFetch('/api/logout', { method: 'POST' }); } catch (e) {}
    localStorage.clear();
    router.replace('/');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="dash-layout text-slate-900">
      <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      {/* Sidebar Admin */}
      <aside className={`dash-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="dash-sidebar-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-xl">A</div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">Portal Admin</h1>
              <p className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase mt-0.5">E-Konseling v3</p>
            </div>
          </div>
        </div>

        <nav className="dash-sidebar-nav">
          <AdminNavLink active={true} icon={<GridIcon />} label="Dashboard Ringkasan" href="/admin" />
          <AdminNavLink icon={<GuruIcon />} label="Kelola Guru BK" href="/admin/users?role=guru" />
          <AdminNavLink icon={<SiswaIcon />} label="Kelola Data Siswa" href="/admin/users?role=siswa" />
          <AdminNavLink icon={<FileIcon />} label="Laporan Kasus" href="/admin/reports" />
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
             <span className="font-extrabold text-slate-800">Portal Admin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-800 focus:outline-none">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-fadeIn mt-4 lg:mt-0">
          <div>
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Kontrol Panel</h2>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Ringkasan Sistem</h1>
          </div>
          <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-100">
             <AvatarUpload user={user} onUploadSuccess={setUser} bg="bg-slate-900" />
             <div>
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Administrator</p>
             </div>
          </div>
        </header>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12 animate-slide-up">
           <StatCardAdmin label="Total Siswa" value={stats.total_siswa} icon={<SiswaIcon />} color="text-teal-600" bg="bg-teal-50" />
           <StatCardAdmin label="Guru BK Aktif" value={stats.total_guru} icon={<GuruIcon />} color="text-emerald-600" bg="bg-emerald-50" />
           <StatCardAdmin label="Kasus Tercatat" value={stats.total_kasus} icon={<FileIcon />} color="text-amber-600" bg="bg-amber-50" />
           <StatCardAdmin label="Admin Panel" value={stats.total_admin} icon={<GridIcon />} color="text-slate-600" bg="bg-slate-50" />
        </div>

        {/* Quick Links / Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
           <AdminActionCard 
              title="Manajemen Pengguna Guru" 
              desc="Tambah, edit, atau hapus akses Guru BK ke dalam sistem." 
              link="/admin/users?role=guru"
              icon={<GuruIcon />}
              primaryColor="bg-emerald-600"
           />
           <AdminActionCard 
              title="Basis Data Peserta Didik" 
              desc="Kelola data pendaftaran siswa, NISN, dan validasi akun." 
              link="/admin/users?role=siswa"
              icon={<SiswaIcon />}
              primaryColor="bg-teal-600"
           />
        </div>

        {/* System Health / Recent Activity Placeholder */}
        <section className="mt-12 dash-card animate-slide-up" style={{ animationDelay: '200ms' }}>
           <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Status Server & Sistem
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                 <span className="text-sm font-medium text-slate-500">API Gateway</span>
                 <span className="badge badge-success text-[10px]">Operational</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                 <span className="text-sm font-medium text-slate-500">Database Engine</span>
                 <span className="badge badge-success text-[10px]">Connected</span>
              </div>
              <div className="p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                 <span className="text-sm font-medium text-slate-500">Real-time Stream</span>
                 <span className="badge badge-success text-[10px]">Active</span>
              </div>
           </div>
        </section>
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

function AdminActionCard({ title, desc, link, icon, primaryColor }) {
  return (
    <div className="dash-card group hover:scale-[1.02] transition-all duration-300">
       <div className="flex items-start justify-between">
          <div className="flex-1">
             <div className={`w-12 h-12 rounded-2xl ${primaryColor} text-white flex items-center justify-center mb-6 shadow-xl`}>
                {icon}
             </div>
             <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
             <p className="text-sm text-slate-500 leading-relaxed max-w-[250px] mb-8">{desc}</p>
             <a href={link} className={`inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest ${primaryColor.replace('bg-', 'text-')} hover:gap-3 transition-all`}>
                Buka Pengaturan 
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
             </a>
          </div>
       </div>
    </div>
  );
}

// Stats Card custom tag implementation for the JSX above
function StatCardAdmin({ label, value, icon, color, bg }) {
  return (
    <div className="dash-card flex items-center gap-5 !mb-0">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative z-10 shadow-sm ${bg} ${color}`}>{icon}</div>
       <div className="relative z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
       </div>
    </div>
  );
}

// Icons
const GridIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const GuruIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const SiswaIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>;
const FileIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>;

// Map custom tag to function for usage in JSX
const StatCard = StatCardAdmin;
