"use client";
import { useState } from "react";

export default function LaporanManagement({ 
  allLaporan, 
  allStudents, 
  isLoadingLaporan, 
  showLaporanForm, 
  setShowLaporanForm, 
  laporanStatusFilter, 
  setLaporanStatusFilter,
  laporanForm,
  setLaporanForm,
  isSubmittingLaporan,
  onSubmitLaporan,
  onEditStatus,
  onDeleteLaporan
}) {
  const [downloadingId, setDownloadingId] = useState(null);

  const filteredLaporan = allLaporan.filter(l =>
    laporanStatusFilter === 'semua' ? true : l.status === laporanStatusFilter
  );

  // Download PDF menggunakan fetch + blob agar Authorization header bisa dikirim
  // Ini lebih handal dibanding link <a> langsung yang tidak bisa kirim header
  const handleDownloadPDF = async (lap) => {
    if (downloadingId === lap.id) return; // cegah double-click
    setDownloadingId(lap.id);
    try {
      const token = localStorage.getItem('api_token');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/api/laporan/${lap.id}/export-pdf?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Gagal mengunduh PDF.');
        return;
      }

      // Buat URL sementara dari blob lalu trigger download
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Konseling_${lap.siswa?.name || 'Siswa'}_${new Date().toLocaleDateString('id-ID').replace(/\//g, '')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download PDF error:', err);
      alert('Gagal mengunduh PDF. Pastikan server berjalan.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Laporan Kasus</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Dokumentasi resmi penanganan masalah peserta didik.</p>
        </div>
        <button 
          onClick={() => setShowLaporanForm(!showLaporanForm)}
          className={`flex items-center gap-3 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 border ${showLaporanForm ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-emerald-600 text-white border-emerald-500/20 shadow-lg shadow-emerald-950/50'}`}
        >
          {showLaporanForm ? 'Batal / Tutup Form' : 'Terbitkan Laporan Baru'}
        </button>
      </div>

      {showLaporanForm && (
        <div className="dash-card p-8 animate-slide-up">
          <form onSubmit={onSubmitLaporan} className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nama Siswa</label>
                  <select 
                    required
                    className="input-field"
                    value={laporanForm.siswa_id}
                    onChange={e => setLaporanForm({...laporanForm, siswa_id: e.target.value})}
                  >
                    <option value="">Cari Siswa...</option>
                    {allStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.kelas})</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori Masalah</label>
                  <select 
                    className="input-field"
                    value={laporanForm.kategori}
                    onChange={e => setLaporanForm({...laporanForm, kategori: e.target.value})}
                  >
                    {['Perilaku', 'Akademik', 'Kehadiran', 'Privasi/Sosial', 'Lainnya'].map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Kejadian</label>
                  <input 
                    type="date" required
                    className="input-field"
                    value={laporanForm.tanggal_kejadian}
                    onChange={e => setLaporanForm({...laporanForm, tanggal_kejadian: e.target.value})}
                  />
                </div>
             </div>

             <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Judul Ringkas Kasus</label>
               <input 
                 type="text" required placeholder="Contoh: Ketidakhadiran berturut-turut tanpa keterangan"
                 className="input-field"
                 value={laporanForm.judul}
                 onChange={e => setLaporanForm({...laporanForm, judul: e.target.value})}
               />
             </div>

             <div className="space-y-1">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kronologi & Analisis Guru</label>
               <textarea 
                 required rows={4}
                 className="input-field min-h-[120px]"
                 placeholder="Jelaskan secara mendalam mengenai masalah yang dilaporkan..."
                 value={laporanForm.deskripsi}
                 onChange={e => setLaporanForm({...laporanForm, deskripsi: e.target.value})}
               />
             </div>

             <div className="flex justify-end pt-4">
               <button 
                 type="submit" disabled={isSubmittingLaporan}
                 className="btn-primary px-12 py-4"
               >
                 {isSubmittingLaporan ? 'Sedang Memproses...' : 'Simpan & Publikasi Laporan'}
               </button>
             </div>
          </form>
        </div>
      )}

      {/* Filter & List */}
      <div className="space-y-6">
        <div className="flex gap-2 p-1 bg-slate-900/40 border border-slate-800/60 rounded-xl w-fit">
          {['semua', 'Dalam Proses', 'Ditangani', 'Selesai'].map(f => (
            <button 
              key={f} onClick={() => setLaporanStatusFilter(f)}
              className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                laporanStatusFilter === f 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >{f}</button>
          ))}
        </div>
        
        <div className="dash-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Judul Kasus</th>
                  <th>Identitas Siswa</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredLaporan.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-16 text-slate-400 font-medium italic">Database laporan kosong untuk kategori ini.</td></tr>
                ) : (
                  filteredLaporan.map(lap => (
                    <tr key={lap.id} className="group">
                      <td>
                        <p className="font-bold text-slate-100 leading-tight">{lap.judul}</p>
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">{lap.kategori}</p>
                      </td>
                      <td>
                        <p className="font-bold text-slate-200">{lap.siswa?.name || 'Siswa'}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{lap.siswa?.kelas || '-'}</p>
                      </td>
                      <td>
                        <StatusBadge status={lap.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDownloadPDF(lap)}
                            disabled={downloadingId === lap.id}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/40 text-slate-400 hover:text-red-500 transition-all border border-slate-700/40 disabled:opacity-50 disabled:cursor-not-allowed" 
                            title={downloadingId === lap.id ? 'Sedang mengunduh...' : 'Unduh PDF'}
                          >
                            {downloadingId === lap.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            )}
                          </button>
                          <button onClick={() => onEditStatus(lap)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/40 text-slate-400 hover:text-emerald-400 transition-all border border-slate-700/40"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                          <button onClick={() => onDeleteLaporan(lap.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800/40 text-slate-400 hover:text-red-400 transition-all border border-slate-700/40"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    'Selesai': 'badge-success',
    'Ditangani': 'badge-warning',
    'Dalam Proses': 'badge-warning'
  };
  return <span className={`badge ${cfg[status] || 'badge-warning'}`}>{status.toUpperCase()}</span>;
}
