"use client";

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
  const filteredLaporan = allLaporan.filter(l => 
    laporanStatusFilter === 'semua' ? true : l.status === laporanStatusFilter
  );

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
          className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 ${showLaporanForm ? 'bg-slate-200 text-slate-700' : 'bg-emerald-600 text-white shadow-emerald-100'}`}
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
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
          {['semua', 'Dalam Proses', 'Ditangani', 'Selesai'].map(f => (
            <button 
              key={f} onClick={() => setLaporanStatusFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                laporanStatusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
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
                        <p className="font-bold text-slate-900 leading-tight">{lap.judul}</p>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">{lap.kategori}</p>
                      </td>
                      <td>
                        <p className="font-bold text-slate-700">{lap.siswa?.name || 'Siswa'}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest">{lap.siswa?.kelas || '-'}</p>
                      </td>
                      <td>
                        <StatusBadge status={lap.status} />
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <a 
                            href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/laporan/${lap.id}/export-pdf`} 
                            target="_blank" rel="noreferrer"
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-500 transition-all border border-slate-100" title="Cetak PDF"
                          >
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </a>
                          <button onClick={() => onEditStatus(lap)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all border border-slate-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                          <button onClick={() => onDeleteLaporan(lap.id)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-red-400 transition-all border border-slate-100"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
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
