import { useState } from "react";
import Link from "next/link";

export default function QueueTable({ 
  queueTab, 
  setQueueTab, 
  newRequests, 
  acceptedQueue,
  historyQueue,
  unreadCounts, 
  onProcessRequest, 
  onUpdateStatus,
  onOpenProfile,
  onRescheduleRequest,
  onBuatLaporan
}) {
  const [rescheduleModal, setRescheduleModal] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ tanggal: "", waktu: "" });
  const tabs = [
    { id: 'menunggu', label: 'Konfirmasi', count: newRequests.length },
    { id: 'terjadwal', label: 'Aktif', count: acceptedQueue.length },
    { id: 'riwayat', label: 'Riwayat', count: historyQueue?.length || 0 },
  ];

  let filteredData = [];
  if (queueTab === 'menunggu') filteredData = newRequests;
  else if (queueTab === 'terjadwal') filteredData = acceptedQueue;
  else if (queueTab === 'riwayat' || queueTab === 'selesai') filteredData = historyQueue || [];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setQueueTab(tab.id)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
              queueTab === tab.id 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {tab.count > 0 && <span className={`px-2 py-0.5 rounded-lg text-[9px] ${queueTab === tab.id ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{tab.count}</span>}
          </button>
        ))}
      </div>

      <div className="dash-card overflow-hidden">
        <div className="dash-table-container">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Siswa & Kelas</th>
                <th>Jadwal Pertemuan</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16 text-slate-400 font-medium italic">Tidak ada data bimbingan di kategori ini.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="group">
                    <td>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center cursor-pointer overflow-hidden border border-emerald-100"
                          onClick={() => onOpenProfile(item.studentProfile)}
                        >
                          {item.studentProfile?.photo ? (
                            <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${item.studentProfile.photo}`} className="w-full h-full object-cover" />
                          ) : item.studentName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{item.studentName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.class}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                       <p className="font-bold text-slate-700">{new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</p>
                       <p className="text-xs text-emerald-600 font-medium">{item.time} WIB</p>
                    </td>
                    <td>
                       <StatusBadge status={item.status} />
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-3">
                        {queueTab === 'menunggu' ? (
                          <>
                            <button onClick={() => onProcessRequest(item.id, 'tolak')} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">Tolak</button>
                            <button onClick={() => setRescheduleModal(item)} className="text-xs font-bold text-amber-500 hover:text-amber-600 transition-colors uppercase tracking-widest">Ubah Waktu</button>
                            <button onClick={() => onProcessRequest(item.id, 'setuju')} className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">Setujui</button>
                          </>
                        ) : queueTab === 'terjadwal' ? (
                          <>
                            <Link 
                              href={`/chat?targetId=${item.studentProfile?.id}&targetName=${encodeURIComponent(item.studentName)}&targetRole=siswa`}
                              className="relative w-9 h-9 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl flex items-center justify-center transition-all"
                            >
                              💬
                              {unreadCounts[item.studentProfile?.id] > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold rounded-full border-2 border-white flex items-center justify-center">{unreadCounts[item.studentProfile?.id]}</span>
                              )}
                            </Link>
                            <select 
                               className="input-field !py-1 !px-2 !text-[10px] !w-32 !rounded-xl"
                               value={item.status}
                               onChange={(e) => onUpdateStatus(item.id, e.target.value)}
                            >
                               <option value="Terjadwal">Terjadwal</option>
                               <option value="Sedang Konseling">Proses</option>
                               <option value="Selesai">Selesai</option>
                            </select>
                          </>
                        ) : (
                           <div className="flex items-center justify-end gap-2">
                             <Link 
                               href={`/chat?targetId=${item.studentProfile?.id}&targetName=${encodeURIComponent(item.studentName)}&targetRole=siswa`}
                               className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                             >
                               Buka Obrolan
                             </Link>
                             <button
                               onClick={() => onBuatLaporan(item.studentProfile)}
                               className="text-xs font-bold text-white bg-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors shadow-sm"
                             >
                               Buat Rekap
                             </button>
                           </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {rescheduleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="dash-card w-full max-w-sm p-6 animate-scaleIn shadow-2xl relative">
            <h4 className="text-lg font-bold text-slate-900 mb-4">Usulkan Waktu Baru</h4>
            <p className="text-xs text-slate-500 mb-6">Pilih tanggal dan jam alternatif untuk <b>{rescheduleModal.studentName}</b>.</p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tanggal Baru</label>
                <input 
                  type="date" 
                  className="input-field" 
                  value={rescheduleData.tanggal}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleData({...rescheduleData, tanggal: e.target.value})}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jam Baru</label>
                <select 
                  className="input-field" 
                  value={rescheduleData.waktu}
                  onChange={(e) => setRescheduleData({...rescheduleData, waktu: e.target.value})}
                >
                   <option value="" disabled>Pilih Jam Baru</option>
                   <option value="10:30">10:30 WIB</option>
                   <option value="11:00">11:00 WIB</option>
                   <option value="11:30">11:30 WIB</option>
                   <option value="12:00">12:00 WIB</option>
                   <option value="12:30">12:30 WIB</option>
                   <option value="13:00">13:00 WIB</option>
                   <option value="13:30">13:30 WIB</option>
                   <option value="14:00">14:00 WIB</option>
                   <option value="14:30">14:30 WIB</option>
                   <option value="15:00">15:00 WIB</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setRescheduleModal(null); setRescheduleData({tanggal: "", waktu: ""}); }} 
                className="flex-1 py-3 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl"
              >Batal</button>
              <button 
                onClick={() => {
                  if(!rescheduleData.tanggal || !rescheduleData.waktu) return alert('Pilih tanggal dan jam');
                  onRescheduleRequest(rescheduleModal.id, rescheduleData.tanggal, rescheduleData.waktu);
                  setRescheduleModal(null);
                  setRescheduleData({tanggal: "", waktu: ""});
                }}
                className="flex-1 py-3 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-xl"
              >Kirim Usulan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    'Terjadwal': 'badge-success',
    'Sedang Konseling': 'badge-warning',
    'Selesai': 'badge-success',
    'Dibatalkan': 'badge-danger',
    'Ditolak': 'badge-danger',
    'Menunggu Konfirmasi': 'badge-warning'
  };
  return <span className={`badge ${cfg[status] || 'badge-warning'}`}>{status}</span>;
}
