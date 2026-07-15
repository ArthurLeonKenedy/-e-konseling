"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthGuard } from "../hooks/useAuthGuard";
import NotificationBanner from "../components/NotificationBanner";
import AvatarUpload from "../components/AvatarUpload";
import CalendarPicker from "../components/CalendarPicker";
import Link from "next/link";
import { apiFetch } from "../../lib/apiFetch";

function SiswaDashboardContent() {
  const { isAuthorized } = useAuthGuard("siswa");
  const searchParams = useSearchParams();
  const namaSiswa = searchParams.get("nama") || "Siswa";
  const kelasSiswa = searchParams.get("kelas") || "Umum";
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [dashboardTab, setDashboardTab] = useState('aktif');
  const [unreadCounts, setUnreadCounts] = useState({});
  const [user, setUser] = useState(null);
  
  // Booking Form State
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookedDates, setBookedDates] = useState([]);
  const [bookingTime, setBookingTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Profile State
  const [profile, setProfile] = useState({ hobi: "", visi: "", photo: null, preview: null });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleLogout = async () => {
    try { await apiFetch('/api/logout', { method: 'POST' }); } catch (e) {}
    localStorage.clear();
    router.replace('/');
  };

  const fetchData = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const parsedUser = JSON.parse(userStr);
      setUser(parsedUser);

      // Fetch Bookings
      const resB = await apiFetch(`/api/konselings?siswa_id=${parsedUser.id}`);
      const dataB = await resB.json();
      if (dataB.success) {
        setMyBookings(dataB.data.map(k => ({
          id: k.id, guruName: k.guru.name, date: k.tanggal, time: k.waktu, status: k.status, topic: k.topik,
          usulan_tanggal: k.usulan_tanggal, usulan_waktu: k.usulan_waktu
        })));
      }

      // Fetch Unread Chats
      const resU = await apiFetch(`/api/chats/unread`);
      const dataU = await resU.json();
      if (dataU.success) {
        const counts = {};
        dataU.data.forEach(item => counts[item.sender_id] = item.total);
        setUnreadCounts(counts);
      }
    } catch (e) { console.error(e); }
  };

  const fetchSchedules = async () => {
    try {
      const resS = await apiFetch(`/api/schedules`);
      const dataS = await resS.json();
      if (dataS.success) {
        // Group by Guru
        const map = new Map();
        dataS.data.forEach(s => {
          if (!map.has(s.guru_id) || s.status === 'Tersedia') {
            map.set(s.guru_id, {
              id: s.id, guruId: s.guru_id, name: s.guru_name, status: s.status, hari: s.hari, jamMulai: s.jam_mulai, jamSelesai: s.jam_selesai
            });
          }
        });
        setSchedules(Array.from(map.values()));
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
       const u = JSON.parse(userStr);
       setUser(u);
       setProfile(p => ({ ...p, hobi: u.hobi || "", visi: u.rencana_masa_depan || "", preview: u.photo ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${u.photo}` : null }));
    }
    fetchSchedules();
    fetchData();
    const inv = setInterval(fetchData, 15000);
    return () => clearInterval(inv);
  }, []);

  useEffect(() => {
    if (selectedSchedule) {
      const fetchBookedDates = async () => {
        try {
          const res = await apiFetch(`/api/konselings?guru_id=${selectedSchedule.guruId}`);
          const data = await res.json();
          if (data.success) {
            const dates = data.data
               .filter(k => ['Menunggu Konfirmasi', 'Terjadwal', 'Sedang Konseling'].includes(k.status))
               .map(k => k.tanggal);
            setBookedDates([...new Set(dates)]);
          }
        } catch(e) { console.error(e); }
      };
      fetchBookedDates();
    }
  }, [selectedSchedule]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Validasi session tab-silang (berguna jika sedang testing 2 akun di browser yang sama)
    if (!user || user.role !== 'siswa') {
        alert("Sesi Anda telah berubah menjadi akun Guru/Admin di tab lain. Silakan gunakan Mode Penyamaran (Incognito) untuk menguji 2 akun sekaligus, atau login ulang sebagai Siswa.");
        window.location.reload();
        return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await apiFetch(`/api/konselings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siswa_id: user.id,
          guru_id: selectedSchedule.guruId,
          guru_name: selectedSchedule.name,
          tanggal: bookingDate,
          waktu: bookingTime,
          topik: category ? `[${category}] ${topic}` : topic
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        fetchData();
        setTimeout(() => {
          setIsSuccess(false); setSelectedSchedule(null);
          setCategory(""); setTopic(""); setBookingDate(""); setBookingTime("");
          setIsSubmitting(false);
          setActiveTab('dashboard');
        }, 1500);
      } else {
        alert(data.message);
        setIsSubmitting(false);
      }
    } catch (e) { alert("Gagal membuat jadwal."); setIsSubmitting(false); }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm("Batalkan pengajuan ini?")) return;
    try {
      const res = await apiFetch(`/api/konselings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Dibatalkan" })
      });
      if ((await res.json()).success) fetchData();
    } catch (e) { alert("Gagal membatalkan."); }
  };

  const handleAcceptReschedule = async (id) => {
    try {
      const res = await apiFetch(`/api/konselings/${id}/accept-reschedule`, { method: "POST" });
      if ((await res.json()).success) fetchData();
    } catch (e) { alert("Gagal menyetujui jadwal."); }
  };

  const handleRejectReschedule = async (id) => {
    if (!confirm("Tolak usulan jadwal dari guru?")) return;
    try {
      const res = await apiFetch(`/api/konselings/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Dibatalkan" }) // Atau Reschedule Ditolak
      });
      if ((await res.json()).success) fetchData();
    } catch (e) { alert("Gagal menolak jadwal."); }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const fd = new FormData();
    fd.append('user_id', user.id);
    fd.append('hobi', profile.hobi);
    fd.append('rencana_masa_depan', profile.visi);
    if (profile.photo) fd.append('photo', profile.photo);

    try {
      const resRaw = await apiFetch(`/api/update-profile`, { method: "POST", body: fd });
      const res = await resRaw.json();
      if (res.success) {
        setIsSuccess(true);
        const updatedUser = { ...user, hobi: profile.hobi, rencana_masa_depan: profile.visi, photo: res.user.photo };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setTimeout(() => setIsSuccess(false), 3000);
      }
    } catch (e) { alert("Gagal memperbarui profil."); }
    finally { setIsUpdatingProfile(false); }
  };

  if (!isAuthorized) return null;

  return (
    <div className="dash-layout">
      <div className={`mobile-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      {/* Sidebar Profesional */}
      <aside className={`dash-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="dash-sidebar-header">
          <div className="flex items-center gap-4">
            <img src="/logo-smkn1.jpg" alt="Logo SMKN 1" className="w-[52px] h-[52px] rounded-xl object-contain bg-white p-1 shadow-sm border border-slate-700/50" />
            <div>
              <h1 className="text-[15px] font-extrabold tracking-tight">Portal Siswa</h1>
              <p className="text-[10px] font-bold text-emerald-400 tracking-[0.15em] uppercase mt-0.5">E-Konseling</p>
            </div>
          </div>
        </div>

        <nav className="dash-sidebar-nav">
          <SidebarLink active={activeTab === 'dashboard'} icon={<HomeIcon />} label="Beranda" onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
          <SidebarLink active={activeTab === 'booking'} icon={<CalendarIcon />} label="Booking Guru" onClick={() => { setActiveTab('booking'); setIsSidebarOpen(false); }} />
          <SidebarLink active={activeTab === 'profile'} icon={<UserIcon />} label="Profil Saya" onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }} />
        </nav>

        <div className="p-6 border-t border-slate-800/50">
          <button onClick={handleLogout} className="dash-nav-item hover:text-red-400 w-full justify-start text-slate-400">
             <LogoutIcon /> Keluar Sesi
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="dash-content">
        <div className="mobile-topbar">
          <div className="flex items-center gap-3">
             <img src="/logo-smkn1.jpg" alt="Logo" className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-sm border border-slate-200" />
             <span className="font-extrabold text-slate-800">E-Konseling</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-800 focus:outline-none">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <NotificationBanner />

        {/* Top Header */}
        <div style={{background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)', borderRadius: '12px', padding: '1px', marginBottom: '40px', boxShadow: '0 8px 32px rgba(5, 150, 105, 0.35)' }}>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 p-6" style={{borderRadius: '11px'}}>
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 flex items-center justify-center p-0.5 rounded-xl shrink-0 border border-white/20 bg-white/5">
                 <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center" style={{background: 'rgba(255,255,255,0.1)'}}>
                   {profile.preview ? (
                     <img src={profile.preview} className="w-full h-full object-cover" alt="Profile" />
                   ) : (
                     <span className="text-2xl font-extrabold text-white">{namaSiswa.charAt(0)}</span>
                   )}
                 </div>
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight" style={{color: '#ffffff'}}>
                  Halo, {namaSiswa} <span className="font-bold text-lg" style={{color: 'rgba(255,255,255,0.7)'}}>({kelasSiswa})</span>
                </h2>
                <p className="text-[11px] font-bold uppercase tracking-widest mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>Portal Layanan Bimbingan & Konseling</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl text-xs font-extrabold w-fit" style={{background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', backdropFilter: 'blur(8px)'}}>
              <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background: '#86efac', boxShadow: '0 0 8px rgba(134,239,172,0.8)'}} />
              SISTEM ONLINE
            </div>
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-slide-up">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Jadwal Aktif" value={myBookings.filter(b => b.status === "Terjadwal" || b.status === "Menunggu Konfirmasi").length} icon={<ClockIcon />} color="bg-emerald-50 text-emerald-600" />
              <StatCard label="Pesan Baru" value={Object.values(unreadCounts).reduce((a, b) => a + b, 0)} icon={<ChatIcon />} color="bg-blue-50 text-blue-600" />
              <StatCard label="Total Selesai" value={myBookings.filter(b => b.status === "Selesai").length} icon={<CheckIcon />} color="bg-slate-50 text-slate-600" />
            </div>

            {/* My Bookings Table */}
            <section className="dash-card">
              <div className="dash-card-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">📅</span>
                  Jadwal Konseling Saya
                </h3>
                <div className="flex bg-slate-900/40 border border-slate-800/60 p-1 rounded-lg w-full sm:w-auto">
                  <button onClick={() => setDashboardTab('aktif')} className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${dashboardTab === 'aktif' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50' : 'text-slate-400 hover:text-slate-200'}`}>Konseling Aktif</button>
                  <button onClick={() => setDashboardTab('riwayat')} className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all ${dashboardTab === 'riwayat' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50' : 'text-slate-400 hover:text-slate-200'}`}>Riwayat</button>
                </div>
              </div>

              <div className="dash-table-container">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Guru Pembimbing</th>
                      <th>Waktu</th>
                      <th>Status</th>
                      <th className="text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myBookings.filter(b => dashboardTab === 'aktif' ? !["Selesai", "Dibatalkan", "Ditolak"].includes(b.status) : ["Selesai", "Dibatalkan", "Ditolak"].includes(b.status)).length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-slate-400 font-medium italic">Belum ada riwayat {dashboardTab === 'aktif' ? 'konseling aktif' : 'arsip konseling'}.</td>
                      </tr>
                    ) : myBookings.filter(b => dashboardTab === 'aktif' ? !["Selesai", "Dibatalkan", "Ditolak"].includes(b.status) : ["Selesai", "Dibatalkan", "Ditolak"].includes(b.status)).map((b, idx) => (
                      <tr key={b.id ?? `booking-${idx}`}>
                        <td>
                          <p className="font-bold text-slate-900">{b.guruName}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{b.topic}</p>
                        </td>
                        <td>
                          <p className="font-semibold text-slate-700">{b.date}</p>
                          <p className="text-xs text-slate-400">{b.time} WIB</p>
                          {b.status === "Usulan Reschedule" && b.usulan_tanggal && (
                             <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Usulan Guru:</p>
                                <p className="text-xs text-amber-900 font-medium">{new Date(b.usulan_tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} • {b.usulan_waktu} WIB</p>
                             </div>
                          )}
                        </td>
                        <td>
                          <StatusBadge status={b.status} />
                        </td>
                        <td className="text-right">
                          <div className="flex flex-col items-end gap-2">
                            {b.status === "Menunggu Konfirmasi" && (
                              <button onClick={() => handleCancelBooking(b.id)} className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">Batalkan</button>
                            )}
                            {b.status === "Usulan Reschedule" && (
                              <div className="flex gap-2">
                                <button onClick={() => handleRejectReschedule(b.id)} className="px-3 py-1 text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-md">Tolak</button>
                                <button onClick={() => handleAcceptReschedule(b.id)} className="px-3 py-1 text-[10px] font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-md shadow-sm shadow-amber-200">Setuju</button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="space-y-8 animate-slide-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Cari Guru Pembimbing</h3>
                <p className="text-sm text-slate-500 mt-1">Pilih guru yang tersedia untuk berkonsultasi.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {schedules.map((s, index) => (
                <div key={s.id ?? `schedule-${index}`} className="dash-card flex flex-col items-center group relative overflow-hidden hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 !p-6 border border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
                  <div className="relative mb-5 mt-2">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white flex items-center justify-center text-4xl font-extrabold group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-emerald-500/20">
                      {s.name.charAt(0)}
                    </div>
                    <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-slate-900 shadow-sm ${s.status === 'Tersedia' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                  </div>
                  
                  <div className="w-full text-center mb-5">
                    <h4 className="font-extrabold text-slate-100 text-xl truncate px-2">{s.name}</h4>
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Guru Bimbingan Konseling</p>
                  </div>
                  
                  <div className="w-full flex flex-col gap-3 mb-6 text-xs border-t border-slate-800/60 pt-5">
                     <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Hari Tersedia</span>
                        <span className="text-slate-200 font-semibold text-right">{s.hari || '-'}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Jam Kerja</span>
                        <span className="text-slate-200 font-semibold text-right">{s.jamMulai || '-'} - {s.jamSelesai || '-'}</span>
                     </div>
                     {s.status !== 'Tersedia' && (
                       <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-medium">Status</span>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase ${s.status === 'Sedang Cuti' ? 'bg-red-950/40 text-red-400 border border-red-900/30' : 'bg-amber-950/40 text-amber-400 border border-amber-900/30'}`}>{s.status}</span>
                       </div>
                     )}
                  </div>
                  
                  <div className="w-full flex gap-3 mt-auto">
                    <Link 
                      href={`/chat?targetId=${s.guruId}&targetName=${encodeURIComponent(s.name)}&targetRole=guru`}
                      className="flex-1 py-3 rounded-xl bg-slate-800/40 text-slate-300 font-bold text-xs hover:bg-emerald-500/10 hover:text-emerald-400 transition-all duration-200 flex items-center justify-center gap-2 relative border border-slate-700/40"
                    >
                      Chat 💬
                      {unreadCounts[s.guruId] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full border-2 border-slate-900">{unreadCounts[s.guruId]}</span>
                      )}
                    </Link>
                    <button 
                      onClick={() => setSelectedSchedule(s)}
                      disabled={s.status !== 'Tersedia'}
                      className="flex-[2] btn-primary py-3 text-xs disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-emerald-950/50"
                    >
                       Booking 📅
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="max-w-2xl animate-slide-up">
            <form onSubmit={updateProfile} className="dash-card space-y-6">
               <div className="dash-card-header">Kelola Profil</div>
               
               <div className="flex flex-col sm:flex-row gap-8 items-center">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden bg-slate-100 ring-4 ring-emerald-50 shadow-inner">
                       {profile.preview ? <img src={profile.preview} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">📷</div>}
                    </div>
                    <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-emerald-700 transition-colors">
                       <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) setProfile({...profile, photo: file, preview: URL.createObjectURL(file)});
                       }} />
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                    </label>
                  </div>
                  <div className="flex-1 space-y-4 w-full">
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hobi / Ketertarikan</label>
                        <input type="text" value={profile.hobi} onChange={(e) => setProfile({...profile, hobi: e.target.value})} className="input-field" placeholder="Cth: Olahraga, Membaca..." />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rencana Masa Depan</label>
                        <textarea value={profile.visi} onChange={(e) => setProfile({...profile, visi: e.target.value})} className="input-field min-h-[100px]" placeholder="Cth: Menjadi Programmer Handal..." />
                     </div>
                  </div>
               </div>

               <button type="submit" disabled={isUpdatingProfile} className="btn-primary w-full">
                  {isUpdatingProfile ? "Menyimpan..." : "Simpan Perunahan Profil"}
               </button>
            </form>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      {selectedSchedule && (
         <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-start p-4 sm:p-6">
            <form onSubmit={handleBookingSubmit} className="dash-card !bg-white w-full max-w-lg animate-scaleIn shadow-2xl relative my-4 sm:my-8 !overflow-visible">
              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                   <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">✓</div>
                   <h4 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil!</h4>
                   <p className="text-sm text-slate-500">Mohon tunggu konfirmasi dari guru pembimbing.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6 sticky top-0 bg-white/95 backdrop-blur z-10 pb-2 border-b border-slate-100">
                     <h4 className="text-xl font-bold text-slate-900 tracking-tight">Ajukan Konseling</h4>
                     <button type="button" onClick={() => setSelectedSchedule(null)} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 p-1.5 rounded-lg hover:bg-red-50">✕</button>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/50 mb-5 shadow-sm">
                     <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md text-lg">{selectedSchedule.name.charAt(0)}</div>
                     <div className="min-w-0">
                        <p className="text-[9px] sm:text-[10px] font-extrabold text-emerald-600/80 uppercase tracking-widest mb-0.5">Target Konsultasi</p>
                        <p className="text-sm sm:text-[15px] font-bold text-slate-900 tracking-tight truncate">{selectedSchedule.name}</p>
                     </div>
                  </div>

                  <div className="space-y-4 sm:space-y-5">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                              <select value={category} onChange={(e) => setCategory(e.target.value)} required className={`input-field !bg-slate-50 !border-slate-200 focus:!bg-white cursor-pointer transition-colors ${!category ? '!text-slate-400' : '!text-slate-800'}`}>
                                 <option value="" disabled className="text-slate-400">Pilih Kategori</option>
                                 <option value="Akademik" className="text-slate-800">Akademik</option>
                                 <option value="Sosial" className="text-slate-800">Sosial</option>
                                 <option value="Pribadi" className="text-slate-800">Pribadi</option>
                                 <option value="Karier" className="text-slate-800">Karier</option>
                              </select>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Jam Pertemuan</label>
                              <select 
                                 value={bookingTime} 
                                 onChange={(e) => setBookingTime(e.target.value)} 
                                 required 
                                 className={`input-field !bg-slate-50 !border-slate-200 focus:!bg-white cursor-pointer transition-colors ${!bookingTime ? '!text-slate-400' : '!text-slate-800'}`}
                              >
                                 <option value="" disabled className="text-slate-400">Pilih Jam Pertemuan</option>
                                 <option value="10:30" className="text-slate-800">10:30 WIB</option>
                                 <option value="11:00" className="text-slate-800">11:00 WIB</option>
                                 <option value="11:30" className="text-slate-800">11:30 WIB</option>
                                 <option value="12:00" className="text-slate-800">12:00 WIB</option>
                                 <option value="12:30" className="text-slate-800">12:30 WIB</option>
                                 <option value="13:00" className="text-slate-800">13:00 WIB</option>
                                 <option value="13:30" className="text-slate-800">13:30 WIB</option>
                                 <option value="14:00" className="text-slate-800">14:00 WIB</option>
                                 <option value="14:30" className="text-slate-800">14:30 WIB</option>
                                 <option value="15:00" className="text-slate-800">15:00 WIB</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-1.5 mt-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                           <CalendarPicker selectedDate={bookingDate} onSelectDate={setBookingDate} bookedDates={bookedDates} />
                           {!bookingDate && (
                              <div className="mt-2 flex items-start sm:items-center gap-1.5 text-[11px] font-medium text-amber-600 bg-amber-50/50 px-3 py-2.5 rounded-lg border border-amber-100">
                                 <svg className="w-4 h-4 mt-0.5 sm:mt-0 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                 Silakan pilih tanggal konseling di kalender.
                              </div>
                           )}
                        </div>
                     <div className="space-y-1.5 mt-3 sm:mt-4">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-1">Perihal / Topik Utama</label>
                        <textarea value={topic} onChange={(e) => setTopic(e.target.value)} required className="input-field !bg-slate-50 !border-slate-200 !text-slate-800 focus:!bg-white min-h-[100px] placeholder:text-slate-400 resize-none" placeholder="Ceritakan sedikit gambaran topik yang ingin dibahas..." />
                     </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-6 sm:mt-8 py-3.5 sm:py-4 shadow-emerald-200 shadow-lg">
                     {isSubmitting ? "Memproses..." : "Kirim Pengajuan Konseling"}
                  </button>
                </>
              )}
           </form>
        </div>
      )}
    </div>
  );
}

function SidebarLink({ active, icon, label, onClick }) {
  return (
    <button onClick={onClick} className={`dash-nav-item ${active ? 'active' : ''}`}>
       {icon}
       <span>{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="dash-card flex items-center gap-5 !mb-0">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative z-10 shadow-sm ${color}`}>{icon}</div>
       <div className="relative z-10">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-3xl font-black text-slate-900 tracking-tight">{value}</p>
       </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    "Terjadwal": "badge-success",
    "Selesai": "badge-success",
    "Menunggu Konfirmasi": "badge-warning",
    "Usulan Reschedule": "badge-warning",
    "Dibatalkan": "badge-danger",
    "Ditolak": "badge-danger"
  };
  return <span className={`badge ${config[status] || "badge-warning"}`}>{status}</span>;
}

// Icons
const HomeIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>;
const CalendarIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>;
const UserIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>;
const ClockIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const ChatIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>;
const CheckIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>;

export default function SiswaDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <SiswaDashboardContent />
    </Suspense>
  );
}
