"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthGuard } from "../hooks/useAuthGuard";
import NotificationBanner from "../components/NotificationBanner";
import AvatarUpload from "../components/AvatarUpload";
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
  const [unreadCounts, setUnreadCounts] = useState({});
  const [searchGuru, setSearchGuru] = useState("");
  const [user, setUser] = useState(null);
  
  // Booking Form State
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [category, setCategory] = useState("");
  const [topic, setTopic] = useState("");
  const [bookingDate, setBookingDate] = useState("");
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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    const user = JSON.parse(localStorage.getItem('user'));
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
            <AvatarUpload user={user} onUploadSuccess={setUser} />
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
             <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-lg">E</div>
             <span className="font-extrabold text-slate-800">E-Konseling</span>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-slate-500 hover:text-slate-800 focus:outline-none">
             <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>

        <NotificationBanner />

        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-[0.2em] mb-1">Selamat Datang</h2>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{namaSiswa} <span className="text-slate-400 font-medium">({kelasSiswa})</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <div className="flex items-center justify-end gap-2 mt-1">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                   <span className="text-xs font-bold text-slate-700">Online</span>
                </div>
             </div>
             {profile.preview ? (
               <img src={profile.preview} className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white shadow-lg" alt="Profile" />
             ) : (
               <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold shadow-lg">
                  {namaSiswa.charAt(0)}
               </div>
             )}
          </div>
        </header>

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
              <div className="dash-card-header">
                <h3 className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">📅</span>
                  Jadwal Konseling Saya
                </h3>
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
                    {myBookings.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-slate-400 font-medium italic">Belum ada riwayat pendaftaran.</td>
                      </tr>
                    ) : myBookings.map(b => (
                      <tr key={b.id}>
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
              <div className="relative w-full md:w-80">
                <input 
                  type="text" 
                  placeholder="Cari Nama Guru..." 
                  className="input-field pl-10" 
                  value={searchGuru}
                  onChange={(e) => setSearchGuru(e.target.value)}
                />
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {schedules.filter(s => s.name.toLowerCase().includes(searchGuru.toLowerCase())).map(s => (
                <div key={s.id} className="dash-card flex flex-col items-center text-center group relative overflow-hidden hover:-translate-y-1 transition-all duration-300">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 rounded-3xl bg-emerald-600 text-white flex items-center justify-center text-3xl font-bold shadow-xl shadow-emerald-100 group-hover:scale-110 transition-transform">
                      {s.name.charAt(0)}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg border-4 border-white ${s.status === 'Tersedia' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{s.name}</h4>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 mb-2">Guru Bimbingan Konseling</p>
                  
                  <div className="w-full flex flex-col gap-1 mb-6 text-[11px] font-medium">
                     <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Jadwal:</span>
                        <span className="text-slate-700 font-bold">{s.hari || '-'}</span>
                     </div>
                     <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Waktu:</span>
                        <span className="text-slate-700 font-bold">{s.jamMulai || '-'} s/d {s.jamSelesai || '-'}</span>
                     </div>
                     <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-50">
                        <span className="text-slate-500">Status:</span>
                        <span className={`font-bold ${s.status === 'Tersedia' ? 'text-emerald-600' : s.status === 'Sedang Cuti' ? 'text-red-500' : 'text-amber-500'}`}>{s.status}</span>
                     </div>
                  </div>
                  
                  <div className="w-full flex gap-3 mt-auto">
                    <Link 
                      href={`/chat?targetId=${s.guruId}&targetName=${encodeURIComponent(s.name)}&targetRole=guru`}
                      className="flex-1 py-3 rounded-xl bg-slate-50 text-slate-600 font-bold text-xs hover:bg-emerald-50 hover:text-emerald-600 transition-all flex items-center justify-center gap-2 relative"
                    >
                      Chat 💬
                      {unreadCounts[s.guruId] > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] px-2 py-0.5 rounded-full border-2 border-white">{unreadCounts[s.guruId]}</span>
                      )}
                    </Link>
                    <button 
                      onClick={() => setSelectedSchedule(s)}
                      disabled={s.status !== 'Tersedia'}
                      className="flex-[2] btn-primary py-3 text-xs disabled:opacity-50 disabled:grayscale"
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
           <form onSubmit={handleBookingSubmit} className="dash-card w-full max-w-lg animate-scaleIn shadow-2xl relative">
              {isSuccess ? (
                <div className="py-12 text-center space-y-4">
                   <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">✓</div>
                   <h4 className="text-xl font-bold text-slate-900">Pendaftaran Berhasil!</h4>
                   <p className="text-sm text-slate-500">Mohon tunggu konfirmasi dari guru pembimbing.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-8">
                     <h4 className="text-xl font-bold text-slate-900 tracking-tight">Ajukan Konseling</h4>
                     <button type="button" onClick={() => setSelectedSchedule(null)} className="text-slate-400 hover:text-red-500 transition-colors">✕</button>
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 mb-6">
                     <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">{selectedSchedule.name.charAt(0)}</div>
                     <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Konsultasi</p>
                        <p className="text-sm font-bold text-slate-900">{selectedSchedule.name}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori</label>
                           <select value={category} onChange={(e) => setCategory(e.target.value)} required className="input-field">
                              <option value="">Pilih Kategori</option>
                              <option value="Akademik">Akademik</option>
                              <option value="Sosial">Sosial</option>
                              <option value="Pribadi">Pribadi</option>
                              <option value="Karier">Karier</option>
                           </select>
                        </div>
                        <div className="space-y-1">
                           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal</label>
                           <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required className="input-field" min={new Date().toISOString().split('T')[0]} />
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jam Pertemuan</label>
                        <input type="time" value={bookingTime} onChange={(e) => setBookingTime(e.target.value)} required className="input-field" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Perihal / Topik Utama</label>
                        <textarea value={topic} onChange={(e) => setTopic(e.target.value)} required className="input-field min-h-[100px]" placeholder="Jelaskan secara singkat apa yang ingin dikonsultasikan..." />
                     </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-8 py-4">
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
