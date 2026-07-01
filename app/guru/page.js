"use client";
import { Suspense, useState, useEffect, useMemo } from "react";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { apiFetch } from "../../lib/apiFetch";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Sub-components (redefined for premium style)
import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import QueueTable from "./components/QueueTable";
import LaporanManagement from "./components/LaporanManagement";
import UpdateStatusForm from "./components/UpdateStatusForm";
import InboxManagement from "./components/InboxManagement";
import ScheduleManagement from "./components/ScheduleManagement";

function GuruDashboardContent() {
  const { isAuthorized, isChecking } = useAuthGuard("guru");
  const [namaGuru, setNamaGuru] = useState("Guru BK");
  const [activeTab, setActiveTab] = useState('antrean');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [queueTab, setQueueTab] = useState('menunggu');
  const router = useRouter();

  // States
  const [newRequests, setNewRequests] = useState([]);
  const [acceptedQueue, setAcceptedQueue] = useState([]);
  const [historyQueue, setHistoryQueue] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [allKonseling, setAllKonseling] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allLaporan, setAllLaporan] = useState([]);
  const [totalUnread, setTotalUnread] = useState(0);
  
  // UI States
  const [selectedStudentProfile, setSelectedStudentProfile] = useState(null);
  const [showLaporanForm, setShowLaporanForm] = useState(false);
  const [laporanStatusFilter, setLaporanStatusFilter] = useState('semua');
  const [editStatusLaporan, setEditStatusLaporan] = useState(null);
  
  const [laporanForm, setLaporanForm] = useState({
    siswa_id: '', judul: '', kategori: 'Perilaku', deskripsi: '',
    tanggal_kejadian: new Date().toISOString().split('T')[0], tingkat_keparahan: 'Ringan', tindakan: ''
  });

  const [isLoading, setIsLoading] = useState({ students: false, laporan: false, submitting: false });

  // Initial Data Load
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setNamaGuru(JSON.parse(userStr).name);
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) { router.push('/'); return; }
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'guru') { router.push('/'); return; }
      
      setNamaGuru(parsedUser.name);
      setUser(parsedUser);

      const [konsRes, unreadRes] = await Promise.all([
        apiFetch(`/api/konselings?guru_id=${parsedUser.id}`),
        apiFetch(`/api/chats/unread`)
      ]);

      const konsData = await konsRes.json();
      if (konsData.success) {
        setAllKonseling(konsData.data);
        const pending = konsData.data.filter(k => k.status === 'Menunggu Konfirmasi').map(mapToFrontendFormat);
        const activeStatuses = ['Terjadwal', 'Sedang Konseling', 'Usulan Reschedule'];
        const historyStatuses = ['Selesai', 'Dibatalkan', 'Ditolak'];
        const accepted = konsData.data.filter(k => activeStatuses.includes(k.status)).map(mapToFrontendFormat);
        const history = konsData.data.filter(k => historyStatuses.includes(k.status)).map(mapToFrontendFormat);
        setNewRequests(pending);
        setAcceptedQueue(accepted);
        setHistoryQueue(history);
      }

      const unreadData = await unreadRes.json();
      if (unreadData.success) {
        const counts = {};
        let sum = 0;
        unreadData.data.forEach(item => {
           counts[item.sender_id] = item.total;
           sum += item.total;
        });
        setUnreadCounts(counts);
        setTotalUnread(sum);
      }
    } catch (e) { console.error(e); }
  };

  const mapToFrontendFormat = (k) => ({
    id: k.id, studentName: k.siswa?.name || 'Siswa', class: k.siswa?.kelas || '-',
    date: k.tanggal, time: k.waktu, topic: k.topik, problem: k.topik, status: k.status, studentProfile: k.siswa
  });

  const fetchStudents = async () => {
    setIsLoading(prev => ({ ...prev, students: true }));
    try {
      const res = await apiFetch(`/api/siswa`);
      const data = await res.json();
      if (data.success) setAllStudents(data.data);
    } finally { setIsLoading(prev => ({ ...prev, students: false })); }
  };

  const fetchLaporan = async () => {
    setIsLoading(prev => ({ ...prev, laporan: true }));
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await apiFetch(`/api/laporan?guru_id=${user?.id}`);
      const data = await res.json();
      if (data.success) setAllLaporan(data.data);
    } finally { setIsLoading(prev => ({ ...prev, laporan: false })); }
  };

  useEffect(() => {
    if (activeTab === 'data-siswa') fetchStudents();
    if (activeTab === 'laporan-kasus') { fetchStudents(); fetchLaporan(); }
  }, [activeTab]);

  const handleProcessRequest = async (id, action) => {
    try {
      if (action === 'setuju' || action === 'tolak') {
        const statusMap = { 'setuju': 'Terjadwal', 'tolak': 'Ditolak' };
        const res = await apiFetch(`/api/konselings/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: statusMap[action] })
        });
        if ((await res.json()).success) {
          fetchData();
        }
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleReschedule = async (id, tanggal, waktu) => {
    try {
      const res = await apiFetch(`/api/konselings/${id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usulan_tanggal: tanggal, usulan_waktu: waktu })
      });
      const data = await res.json();
      if (data.success) {
        alert("Usulan waktu berhasil dikirim ke siswa.");
        fetchData();
      } else {
        alert(data.message || "Gagal mengirim usulan.");
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const res = await apiFetch(`/api/konselings/${id}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
    if ((await res.json()).success) fetchData();
  };

  const handleSubmitLaporan = async (e) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, submitting: true }));
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const res = await apiFetch(`/api/laporan`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...laporanForm, guru_id: user?.id })
      });
      if ((await res.json()).success) {
        alert('Laporan Kasus Berhasil Disimpan!');
        setShowLaporanForm(false);
        fetchLaporan();
      }
    } finally { setIsLoading(prev => ({ ...prev, submitting: false })); }
  };

  const handleUpdateLaporanStatus = async (id, status, tindakan) => {
    const res = await apiFetch(`/api/laporan/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, tindakan })
    });
    if ((await res.json()).success) { fetchLaporan(); setEditStatusLaporan(null); }
  };

  const handleDeleteLaporan = async (id) => {
    if (!confirm('Hapus laporan ini secara permanen?')) return;
    const res = await apiFetch(`/api/laporan/${id}`, { method: 'DELETE' });
    if ((await res.json()).success) fetchLaporan();
  };

  // Derived Data
  const counseledStudents = useMemo(() => {
    const map = new Map();
    allKonseling.forEach(k => {
      if (k.siswa) {
        map.set(k.siswa.id, k.siswa);
      }
    });
    return Array.from(map.values());
  }, [allKonseling]);

  const handleBuatLaporan = (studentProfile) => {
    if (!studentProfile) return;
    setActiveTab('laporan-kasus');
    setShowLaporanForm(true);
    setLaporanForm(prev => ({
      ...prev,
      siswa_id: studentProfile.id
    }));
  };

  // Charts Logic
  const categoryData = useMemo(() => {
    const counts = {};
    allKonseling.forEach(k => {
      const cat = k.topik.match(/\[(.*?)\]/)?.[1] || 'Umum';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allKonseling]);

  const trendData = useMemo(() => {
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days[d.toISOString().split('T')[0]] = 0;
    }
    allKonseling.forEach(k => { if (days[k.tanggal] !== undefined) days[k.tanggal]++; });
    return Object.entries(days).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }), count
    }));
  }, [allKonseling]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/');
  };

  if (!isAuthorized) return null;

  return (
    <div className="dash-layout">
      <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      {/* Sidebar - Consistent styling */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} totalUnread={totalUnread} onLogout={handleLogout} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="dash-content">
        <div className="mobile-topbar">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-lg">E</div>
             <span className="font-extrabold text-slate-800">E-Konseling</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-800 focus:outline-none">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <div className="max-w-7xl mx-auto space-y-10 animate-slide-up">
          <DashboardHeader namaGuru={namaGuru} user={user} onUpdateUser={setUser} />

          {activeTab === 'antrean' && (
            <QueueTable
              queueTab={queueTab} setQueueTab={setQueueTab}
              newRequests={newRequests} acceptedQueue={acceptedQueue} historyQueue={historyQueue} unreadCounts={unreadCounts}
              onProcessRequest={handleProcessRequest} onUpdateStatus={handleUpdateStatus}
              onOpenProfile={setSelectedStudentProfile}
              onRescheduleRequest={handleReschedule}
              onBuatLaporan={handleBuatLaporan}
            />
          )}

          {activeTab === 'pesan' && (
             <InboxManagement />
          )}

          {activeTab === 'jadwal' && (
             <ScheduleManagement />
          )}

          {activeTab === 'laporan-kasus' && (
            <LaporanManagement
              allLaporan={allLaporan} allStudents={counseledStudents}
              isLoadingLaporan={isLoading.laporan} showLaporanForm={showLaporanForm}
              setShowLaporanForm={setShowLaporanForm} laporanStatusFilter={laporanStatusFilter}
              setLaporanStatusFilter={setLaporanStatusFilter} laporanForm={laporanForm}
              setLaporanForm={setLaporanForm} isSubmittingLaporan={isLoading.submitting}
              onSubmitLaporan={handleSubmitLaporan} onEditStatus={setEditStatusLaporan}
              onDeleteLaporan={handleDeleteLaporan}
            />
          )}

          {activeTab === 'analitik' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCardGuru label="Pendampingan Aktif" value={acceptedQueue.filter(k => k.status === 'Terjadwal').length} color="text-emerald-600" />
                <StatCardGuru label="Selesai Pekan Ini" value={allKonseling.filter(k => k.status === 'Selesai').length} color="text-blue-600" />
                <StatCardGuru label="Kasus Perlu Tindakan" value={allLaporan.filter(l => l.status === 'Pending').length} color="text-rose-600" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="dash-card group">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <span className="w-1 h-3 bg-emerald-500 rounded-full"></span>
                      Distribusi Masalah Siswa
                   </h4>
                   <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={10} fontWeight="700" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <YAxis fontSize={10} fontWeight="700" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                          <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </section>

                <section className="dash-card group">
                   <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                      <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                      Tren Konsultasi (7 Hari)
                   </h4>
                   <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                              <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" fontSize={10} fontWeight="700" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <YAxis fontSize={10} fontWeight="700" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                          <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                          <Area type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'data-siswa' && (
            <section className="dash-card overflow-hidden">
               <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Database Peserta Didik</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Total terverifikasi: {allStudents.length} siswa</p>
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="dash-table">
                     <thead>
                        <tr>
                           <th>Nama Siswa</th>
                           <th>Identitas</th>
                           <th className="text-right">Aksi</th>
                        </tr>
                     </thead>
                     <tbody>
                        {allStudents.map(s => (
                           <tr key={s.id} className="group">
                              <td>
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">{s.name.charAt(0)}</div>
                                    <span className="font-bold text-slate-700">{s.name}</span>
                                 </div>
                              </td>
                              <td>
                                 <div className="flex items-center gap-2">
                                    <span className="badge badge-success text-[10px]">{s.kelas}</span>
                                    <span className="text-xs font-mono text-slate-400">NISN: {s.nisn}</span>
                                 </div>
                              </td>
                              <td className="text-right">
                                 <button onClick={() => setSelectedStudentProfile(s)} className="text-xs font-bold text-emerald-600 hover:underline">Detail Profil</button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </section>
          )}
        </div>
      </main>

      {/* Profile Detail Modal */}
      {selectedStudentProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
           <div className="dash-card w-full max-w-md overflow-hidden animate-scaleIn">
              <div className="bg-slate-900 h-24 relative">
                 <button onClick={() => setSelectedStudentProfile(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">✕</button>
              </div>
              <div className="px-8 pb-8 pt-0 -mt-12 text-center">
                 <div className="w-24 h-24 rounded-3xl bg-white p-2 shadow-xl mx-auto mb-4 ring-4 ring-white">
                    {selectedStudentProfile.photo ? (
                      <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${selectedStudentProfile.photo}`} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      <div className="w-full h-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl font-bold rounded-2xl">{selectedStudentProfile.name.charAt(0)}</div>
                    )}
                 </div>
                 <h4 className="text-xl font-bold text-slate-900">{selectedStudentProfile.name}</h4>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{selectedStudentProfile.kelas} &bull; {selectedStudentProfile.nisn}</p>
                 
                 <div className="mt-8 space-y-4 text-left">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Minat & Hobi</p>
                       <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedStudentProfile.hobi || "Belum diatur oleh siswa"}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                       <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1.5">Visi Masa Depan</p>
                       <p className="text-sm font-medium text-slate-700 leading-relaxed">{selectedStudentProfile.rencana_masa_depan || "Belum diatur oleh siswa"}</p>
                    </div>
                 </div>

                 <Link href={`/chat?targetId=${selectedStudentProfile.id}&targetName=${encodeURIComponent(selectedStudentProfile.name)}&targetRole=siswa`} className="btn-primary w-full mt-8">Buka Ruang Chat 💬</Link>
              </div>
           </div>
        </div>
      )}

      {editStatusLaporan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
           <div className="dash-card w-full max-w-md overflow-hidden animate-scaleIn">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <h4 className="font-bold text-slate-900">Penanganan Kasus</h4>
                 <button onClick={() => setEditStatusLaporan(null)}>✕</button>
              </div>
              <UpdateStatusForm laporan={editStatusLaporan} onSave={handleUpdateLaporanStatus} onCancel={() => setEditStatusLaporan(null)} />
           </div>
        </div>
      )}
    </div>
  );
}

function StatCardGuru({ label, value, color }) {
  return (
    <div className="dash-card !p-6 border-l-4 border-l-emerald-500">
       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}

export default function GuruDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <GuruDashboardContent />
    </Suspense>
  );
}
