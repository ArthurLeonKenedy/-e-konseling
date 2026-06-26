"use client";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/apiFetch";

export default function Sidebar({ activeTab, setActiveTab, totalUnread }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.clear();
    router.replace('/');
  };

  const menuItems = [
    { id: 'antrean', label: 'Monitor Antrean', icon: <AntreanIcon /> },
    { id: 'pesan', label: 'Kotak Masuk', icon: <PesanIcon />, count: totalUnread },
    { id: 'jadwal', label: 'Jadwal & Ketersediaan', icon: <ClockIcon /> },
    { id: 'laporan-kasus', label: 'Kasus Peserta Didik', icon: <KasusIcon /> },
    { id: 'analitik', label: 'Statistik & Analisis', icon: <AnalisisIcon /> },
    { id: 'data-siswa', label: 'Manajemen Siswa', icon: <SiswaIcon /> },
  ];

  return (
    <aside className="dash-sidebar">
      <div className="dash-sidebar-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-emerald-900/20">E</div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight">Portal Guru BK</h1>
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none mt-0.5">E-Konseling v3</p>
          </div>
        </div>
      </div>

      <nav className="dash-sidebar-nav">
        {menuItems.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`dash-nav-item ${activeTab === tab.id ? 'active' : ''}`}
          >
            <span>{tab.icon}</span>
            <div className="flex-1 flex justify-between items-center text-left">
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-black ml-2">
                  {tab.count}
                </span>
              )}
            </div>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800/50">
        <button
          onClick={handleLogout}
          className="dash-nav-item hover:text-red-400 w-full justify-start text-slate-400"
        >
          <LogoutIcon />
          <span>Keluar Portal</span>
        </button>
      </div>
    </aside>
  );
}

const AntreanIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PesanIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const KasusIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const AnalisisIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
const SiswaIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
