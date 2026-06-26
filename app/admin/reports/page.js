"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../../lib/apiFetch";

export default function LaporanAdmin() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser || JSON.parse(storedUser).role !== 'admin') {
      router.push('/');
      return;
    }
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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'selesai': return 'bg-emerald-100 text-emerald-700';
      case 'sedang diproses': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen mesh-bg font-sans">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
              Kembali ke Dashboard
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Monitoring Laporan Kasus</h1>
          <p className="text-slate-500 font-medium mt-1">Pantau seluruh laporan kasus siswa yang ditangani oleh Guru BK</p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {isLoading ? (
            <div className="text-center py-12 text-slate-400 font-medium">Memuat laporan...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 font-medium">Belum ada laporan kasus.</div>
          ) : reports.map((report) => (
            <div key={report.id} className="dash-card p-6 bg-white border-none shadow-xl shadow-slate-200/50 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:translate-y-[-4px] transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(report.status)}`}>
                    {report.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">{report.judul}</h4>
                <p className="text-slate-500 text-sm line-clamp-2">{report.deskripsi}</p>
                
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Siswa Terkait</span>
                    <span className="text-sm font-bold text-slate-700">{report.siswa?.name || 'Siswa Umum'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-1">Pelapor (Guru BK)</span>
                    <span className="text-sm font-bold text-slate-700">{report.guru?.name || 'Administrator'}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
