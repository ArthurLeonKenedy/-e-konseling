"use client";
import { useState } from 'react';

export default function UpdateStatusForm({ laporan, onSave, onCancel }) {
  const [status, setStatus] = useState(laporan.status);
  const [tindakan, setTindakan] = useState(laporan.tindakan || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(laporan.id, status, tindakan);
    setSaving(false);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
          Kasus: <span className="text-slate-700 font-bold normal-case">{laporan.judul}</span>
        </p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Siswa: <span className="text-slate-700 font-bold normal-case">{laporan.siswa?.name}</span>
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Status Baru</p>
        <div className="flex gap-2">
          {['Dalam Proses', 'Ditangani', 'Selesai'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold border-2 transition-all ${
                status === s
                  ? s === 'Selesai' ? 'bg-green-600 text-white border-green-600'
                    : s === 'Ditangani' ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >{s}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Catatan Tindakan</p>
        <textarea
          value={tindakan}
          onChange={e => setTindakan(e.target.value)}
          rows={4}
          placeholder="Isi tindakan yang diambil guru BK..."
          className="input-field min-h-[100px]"
        />
      </div>
      <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
        <button type="button" onClick={onCancel} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all">Batal</button>
        <button type="button" onClick={handleSave} disabled={saving} className="btn-primary py-2.5 px-6 text-xs">
          {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </div>
    </div>
  );
}
