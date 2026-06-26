import { useState, useEffect } from "react";
import { apiFetch } from "../../../lib/apiFetch";

export default function ScheduleManagement() {
  const [schedule, setSchedule] = useState({
    hari: "Senin - Jumat",
    jam_mulai: "07:30",
    jam_selesai: "15:30",
    status: "Tersedia",
    kuota_harian: 3
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchMySchedule();
  }, []);

  const fetchMySchedule = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/schedules/me');
      const data = await res.json();
      if (data.success && data.data) {
        setSchedule({
          hari: data.data.hari || "Senin - Jumat",
          jam_mulai: data.data.jam_mulai || "07:30",
          jam_selesai: data.data.jam_selesai || "15:30",
          status: data.data.status || "Tersedia",
          kuota_harian: data.data.kuota_harian ?? 3
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await apiFetch('/api/schedules/update', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule)
      });
      const data = await res.json();
      if (data.success) {
        alert("Jadwal ketersediaan berhasil diperbarui!");
      } else {
        alert(data.message || "Gagal memperbarui jadwal.");
      }
    } catch (e) {
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-500 font-bold">Memuat data jadwal...</div>;
  }

  return (
    <section className="dash-card p-8 animate-slide-up">
      <div className="mb-8 border-b border-slate-100 pb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
          <span className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">🕒</span>
          Pengaturan Ketersediaan & Jadwal
        </h3>
        <p className="text-sm text-slate-500 mt-2 ml-13">
          Atur jam kerja dan status ketersediaan Anda agar siswa tahu kapan Anda bisa dihubungi.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hari Kerja</label>
            <input 
              type="text" 
              value={schedule.hari} 
              onChange={(e) => setSchedule({...schedule, hari: e.target.value})} 
              required 
              className="input-field" 
              placeholder="Cth: Senin - Jumat" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Status Ketersediaan</label>
            <select 
              value={schedule.status} 
              onChange={(e) => setSchedule({...schedule, status: e.target.value})} 
              className="input-field font-bold"
            >
              <option value="Tersedia">🟢 Tersedia (Menerima Chat & Booking)</option>
              <option value="Penuh">🟡 Penuh (Jadwal Padat)</option>
              <option value="Sedang Cuti">🔴 Sedang Cuti (Tidak Bisa Dihubungi)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jam Mulai</label>
            <input 
              type="time" 
              value={schedule.jam_mulai} 
              onChange={(e) => setSchedule({...schedule, jam_mulai: e.target.value})} 
              required 
              className="input-field" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jam Selesai</label>
            <input 
              type="time" 
              value={schedule.jam_selesai} 
              onChange={(e) => setSchedule({...schedule, jam_selesai: e.target.value})} 
              required 
              className="input-field" 
            />
          </div>
          <div className="space-y-2 md:col-span-2 mt-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kuota Harian (Maksimal Siswa Per Hari)</label>
            <input 
              type="number" 
              min="1"
              max="50"
              value={schedule.kuota_harian} 
              onChange={(e) => setSchedule({...schedule, kuota_harian: parseInt(e.target.value) || 1})} 
              required 
              className="input-field w-full md:w-1/2" 
            />
            <p className="text-[10px] text-slate-500 mt-1 ml-1">Sistem akan otomatis menolak pendaftaran baru jika jumlah konseling di suatu hari sudah mencapai batas ini.</p>
          </div>
        </div>

        <div className="pt-4 mt-6 border-t border-slate-100 flex justify-end">
          <button type="submit" disabled={isSaving} className="btn-primary py-3 px-8 text-sm">
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    </section>
  );
}
