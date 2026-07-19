"use client";
import { useState, useEffect } from "react";
import { apiFetch } from "../../../lib/apiFetch";
import toast from "react-hot-toast";

export default function SuratPanggilanManagement() {
  const [suratList, setSuratList] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    siswa_id: "",
    nomor_surat: "",
    tanggal_panggilan: "",
    waktu_panggilan: "",
    alasan: ""
  });

  useEffect(() => {
    fetchSurat();
    fetchStudents();
  }, []);

  const fetchSurat = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/surat-panggilan");
      const data = await res.json();
      if (data.success) {
        setSuratList(data.data);
      }
    } catch (e) {
      console.error("Gagal mengambil data surat panggilan:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await apiFetch("/api/siswa");
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (e) {
      console.error("Gagal mengambil data siswa:", e);
    }
  };

  const handleOpenModal = () => {
    const year = new Date().getFullYear();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setForm({
      siswa_id: "",
      nomor_surat: `SP/${year}/${randNum}`,
      tanggal_panggilan: new Date().toISOString().split("T")[0],
      waktu_panggilan: "08:00",
      alasan: ""
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.siswa_id) {
      toast.error("Silakan pilih siswa terlebih dahulu.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiFetch("/api/surat-panggilan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Surat panggilan berhasil dibuat!");
        setShowModal(false);
        fetchSurat();
      } else {
        toast.error(data.message || "Gagal membuat surat panggilan.");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await apiFetch(`/api/surat-panggilan/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status berhasil diperbarui menjadi ${status}`);
        fetchSurat();
      } else {
        toast.error(data.message || "Gagal memperbarui status.");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus surat panggilan ini secara permanen?")) return;
    try {
      const res = await apiFetch(`/api/surat-panggilan/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Surat panggilan berhasil dihapus.");
        fetchSurat();
      } else {
        toast.error(data.message || "Gagal menghapus surat panggilan.");
      }
    } catch (e) {
      toast.error("Terjadi kesalahan.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Surat Panggilan Siswa</h3>
          <p className="text-sm text-slate-500 mt-1 font-medium">Buat dan pantau surat panggilan resmi untuk siswa.</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-3 px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest bg-emerald-600 text-white border border-emerald-500/20 shadow-lg shadow-emerald-950/50 hover:bg-emerald-700 transition-all active:scale-95 cursor-pointer"
        >
          Buat Panggilan Baru ✉️
        </button>
      </div>

      {/* Main List */}
      <div className="dash-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : suratList.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium italic">
            Belum ada surat panggilan yang diterbitkan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Nomor Surat</th>
                  <th>Nama Siswa</th>
                  <th>Waktu Panggilan</th>
                  <th>Alasan</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {suratList.map((s) => (
                  <tr key={s.id} className="group hover:bg-slate-50/10 transition-colors">
                    <td className="font-mono text-xs font-bold text-slate-200">{s.nomor_surat}</td>
                    <td>
                      <div className="font-bold text-slate-900">{s.siswa?.name || "Siswa Terhapus"}</div>
                      <div className="text-xs text-slate-400">{s.siswa?.kelas || "-"} &bull; {s.siswa?.nisn || "-"}</div>
                    </td>
                    <td>
                      <div className="font-semibold text-slate-700">{s.tanggal_panggilan}</div>
                      <div className="text-xs text-slate-400">{s.waktu_panggilan} WIB</div>
                    </td>
                    <td className="max-w-[250px] truncate text-slate-500" title={s.alasan}>
                      {s.alasan}
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${
                        s.status === "Menunggu"
                          ? "bg-amber-950/40 text-amber-400 border-amber-900/30"
                          : s.status === "Selesai"
                          ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/30"
                          : "bg-red-950/40 text-red-400 border-red-900/30"
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="flex justify-end gap-2">
                        {s.status === "Menunggu" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(s.id, "Selesai")}
                              className="px-2.5 py-1 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors cursor-pointer"
                            >
                              Selesai
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(s.id, "Batal")}
                              className="px-2.5 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
                            >
                              Batalkan
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-slate-400 bg-slate-800 hover:bg-red-900/40 hover:text-red-400 rounded-md transition-all cursor-pointer border border-slate-700"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex justify-center items-start p-4 sm:p-6">
          <div className="dash-card w-full max-w-lg animate-scaleIn shadow-2xl relative bg-slate-900 border border-slate-800 p-8 my-4 sm:my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
              <h4 className="text-lg font-bold text-white">Buat Panggilan Siswa Baru</h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pilih Siswa</label>
                <select
                  required
                  className="input-field"
                  value={form.siswa_id}
                  onChange={(e) => setForm({ ...form, siswa_id: e.target.value })}
                >
                  <option value="">Cari Siswa...</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.kelas})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nomor Surat Panggilan</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={form.nomor_surat}
                  onChange={(e) => setForm({ ...form, nomor_surat: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Panggilan</label>
                  <input
                    type="date"
                    required
                    className="input-field"
                    value={form.tanggal_panggilan}
                    onChange={(e) => setForm({ ...form, tanggal_panggilan: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Waktu Panggilan</label>
                  <input
                    type="time"
                    required
                    className="input-field"
                    value={form.waktu_panggilan}
                    onChange={(e) => setForm({ ...form, waktu_panggilan: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Alasan Pemanggilan</label>
                <textarea
                  required
                  rows={4}
                  className="input-field min-h-[100px]"
                  placeholder="Jelaskan alasan pemanggilan siswa ini..."
                  value={form.alasan}
                  onChange={(e) => setForm({ ...form, alasan: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary px-8 py-3 text-xs"
                >
                  {isSubmitting ? "Memproses..." : "Kirim Surat Panggilan ✉️"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
