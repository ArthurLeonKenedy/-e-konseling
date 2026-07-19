"use client";
import { useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from 'recharts';
import * as XLSX from "xlsx";

const CHART_COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6'];

export default function AnalyticsPanel({ allKonseling, allLaporan }) {
  // Filter States
  const [filterYear, setFilterYear] = useState("semua");
  const [filterSemester, setFilterSemester] = useState("semua");
  const [filterMonth, setFilterMonth] = useState("semua");
  const [filterGuru, setFilterGuru] = useState("semua");
  const [filterJurusan, setFilterJurusan] = useState("semua");
  const [filterKelas, setFilterKelas] = useState("semua");

  // Helper parsers
  const getMajor = (kelas) => {
    if (!kelas) return "Umum";
    const parts = kelas.trim().split(/\s+/);
    if (parts.length >= 2) return parts[1].toUpperCase();
    return "Umum";
  };

  const getGrade = (kelas) => {
    if (!kelas) return "Umum";
    const parts = kelas.trim().split(/\s+/);
    if (parts.length > 0) return parts[0].toUpperCase();
    return "Umum";
  };

  // Get dynamic options from raw data
  const filterOptions = useMemo(() => {
    const years = new Set();
    const gurus = new Set();
    const majors = new Set();
    const classes = new Set();

    allKonseling.forEach(k => {
      if (k.tanggal) {
        const year = k.tanggal.split("-")[0];
        if (year) years.add(year);
      }
      if (k.guru?.name) gurus.add(k.guru.name);
      if (k.siswa?.kelas) {
        majors.add(getMajor(k.siswa.kelas));
        classes.add(getGrade(k.siswa.kelas));
      }
    });

    return {
      years: Array.from(years).sort(),
      gurus: Array.from(gurus).sort(),
      majors: Array.from(majors).sort(),
      classes: Array.from(classes).sort()
    };
  }, [allKonseling]);

  // Filter logic
  const filteredData = useMemo(() => {
    return allKonseling.filter(k => {
      // Filter Tahun
      if (filterYear !== "semua") {
        const year = k.tanggal?.split("-")[0];
        if (year !== filterYear) return false;
      }

      // Filter Bulan
      if (filterMonth !== "semua") {
        const month = parseInt(k.tanggal?.split("-")[1], 10);
        if (month !== parseInt(filterMonth, 10)) return false;
      }

      // Filter Semester (Ganjil: Jul-Des, Genap: Jan-Jun)
      if (filterSemester !== "semua") {
        const month = parseInt(k.tanggal?.split("-")[1], 10);
        if (isNaN(month)) return false;
        if (filterSemester === "ganjil" && (month < 7 || month > 12)) return false;
        if (filterSemester === "genap" && (month < 1 || month > 6)) return false;
      }

      // Filter Guru
      if (filterGuru !== "semua" && k.guru?.name !== filterGuru) return false;

      // Filter Jurusan
      if (filterJurusan !== "semua" && getMajor(k.siswa?.kelas) !== filterJurusan) return false;

      // Filter Kelas
      if (filterKelas !== "semua" && getGrade(k.siswa?.kelas) !== filterKelas) return false;

      return true;
    });
  }, [allKonseling, filterYear, filterSemester, filterMonth, filterGuru, filterJurusan, filterKelas]);

  // Compute Statistics Cards
  const stats = useMemo(() => {
    let total = filteredData.length;
    let menunggu = 0;
    let diproses = 0;
    let selesai = 0;
    let ditolak = 0;

    filteredData.forEach(k => {
      const status = k.status;
      if (status === "Menunggu Konfirmasi" || status === "Usulan Reschedule") {
        menunggu++;
      } else if (status === "Terjadwal" || status === "Sedang Konseling") {
        diproses++;
      } else if (status === "Selesai") {
        selesai++;
      } else if (status === "Ditolak" || status === "Dibatalkan") {
        ditolak++;
      }
    });

    return { total, menunggu, diproses, selesai, ditolak };
  }, [filteredData]);

  // Chart 1: Konseling per Bulan (AreaChart)
  const monthlyChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
    const counts = Array(12).fill(0);

    filteredData.forEach(k => {
      const month = parseInt(k.tanggal?.split("-")[1], 10);
      if (!isNaN(month) && month >= 1 && month <= 12) {
        counts[month - 1]++;
      }
    });

    return months.map((name, index) => ({ name, jumlah: counts[index] }));
  }, [filteredData]);

  // Chart 2: Jenis Permasalahan (BarChart)
  const categoryChartData = useMemo(() => {
    const counts = {};
    filteredData.forEach(k => {
      const cat = k.topik?.match(/\[(.*?)\]/)?.[1] || 'Umum';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([name, jumlah]) => ({ name, jumlah }));
  }, [filteredData]);

  // Chart 3: Status Konseling (PieChart)
  const statusChartData = useMemo(() => {
    return [
      { name: "Menunggu", value: stats.menunggu },
      { name: "Diproses", value: stats.diproses },
      { name: "Selesai", value: stats.selesai },
      { name: "Ditolak/Batal", value: stats.ditolak }
    ].filter(item => item.value > 0);
  }, [stats]);

  // Chart 4: Guru BK Teraktif (BarChart)
  const teacherChartData = useMemo(() => {
    const counts = {};
    filteredData.forEach(k => {
      const name = k.guru?.name || 'Tidak Ditentukan';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, jumlah]) => ({ name, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah)
      .slice(0, 5);
  }, [filteredData]);

  // Chart 5: Jurusan Terbanyak (BarChart)
  const majorChartData = useMemo(() => {
    const counts = {};
    filteredData.forEach(k => {
      const major = getMajor(k.siswa?.kelas);
      counts[major] = (counts[major] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, jumlah]) => ({ name, jumlah }))
      .sort((a, b) => b.jumlah - a.jumlah);
  }, [filteredData]);

  // Excel Export Handler
  const handleExportExcel = () => {
    const summaryData = [
      { "Metrik Statistik": "Total Konseling", "Jumlah Kasus": stats.total },
      { "Metrik Statistik": "Menunggu Konfirmasi", "Jumlah Kasus": stats.menunggu },
      { "Metrik Statistik": "Sedang Diproses", "Jumlah Kasus": stats.diproses },
      { "Metrik Statistik": "Selesai", "Jumlah Kasus": stats.selesai },
      { "Metrik Statistik": "Ditolak / Batal", "Jumlah Kasus": stats.ditolak }
    ];

    const listData = filteredData.map((k, index) => ({
      "No": index + 1,
      "ID Konseling": `#${k.id}`,
      "Nama Siswa": k.siswa?.name || "-",
      "Kelas": k.siswa?.kelas || "-",
      "Guru BK": k.guru?.name || "-",
      "Tanggal": k.tanggal,
      "Waktu": k.waktu,
      "Topik Permasalahan": k.topik || "-",
      "Status": k.status
    }));

    const wb = XLSX.utils.book_new();
    
    // Add worksheets
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Statistik");

    const wsList = XLSX.utils.json_to_sheet(listData);
    XLSX.utils.book_append_sheet(wb, wsList, "Daftar Rekap Kasus");

    // Write file
    XLSX.writeFile(wb, `Laporan_Statistik_E-Konseling_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      
      {/* Filters Container (Hidden in print) */}
      <div className="dash-card p-6 print-hidden">
        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-6">Filter Data Statistik</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tahun</label>
            <select className="input-field" value={filterYear} onChange={e => setFilterYear(e.target.value)}>
              <option value="semua">Semua Tahun</option>
              {filterOptions.years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Semester</label>
            <select className="input-field" value={filterSemester} onChange={e => setFilterSemester(e.target.value)}>
              <option value="semua">Semua Semester</option>
              <option value="ganjil">Semester Ganjil</option>
              <option value="genap">Semester Genap</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bulan</label>
            <select className="input-field" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="semua">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>{new Date(2020, m - 1).toLocaleDateString('id-ID', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Guru BK</label>
            <select className="input-field" value={filterGuru} onChange={e => setFilterGuru(e.target.value)}>
              <option value="semua">Semua Guru BK</option>
              {filterOptions.gurus.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Jurusan</label>
            <select className="input-field" value={filterJurusan} onChange={e => setFilterJurusan(e.target.value)}>
              <option value="semua">Semua Jurusan</option>
              {filterOptions.majors.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kelas</label>
            <select className="input-field" value={filterKelas} onChange={e => setFilterKelas(e.target.value)}>
              <option value="semua">Semua Tingkat</option>
              {filterOptions.classes.map(c => <option key={c} value={c}>Tingkat {c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Export Actions Bar (Hidden in print) */}
      <div className="flex flex-wrap gap-4 items-center justify-between print-hidden">
        <h3 className="text-lg font-bold text-slate-100">Ringkasan Analitik</h3>
        <div className="flex gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800 text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-700 transition-all"
          >
            <span>Cetak Laporan 🖨️</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-slate-700 bg-slate-800 text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-700 transition-all"
          >
            <span>Download PDF 📄</span>
          </button>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-emerald-950/30"
          >
            <span>Download Excel 📊</span>
          </button>
        </div>
      </div>

      {/* Print Document Header (Visible only in print) */}
      <div className="print-only text-center mb-8 border-b-2 border-slate-800 pb-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <img src="/logo-smkn1.jpg" alt="Logo SMKN 1" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>SMK NEGERI 1 PONTIANAK</h2>
            <p style={{ fontSize: '11px', margin: '4px 0 0 0', fontWeight: '500' }}>Jl. Danau Sentarum, Kota Pontianak, Kalimantan Barat</p>
            <p style={{ fontSize: '11px', margin: '2px 0 0 0' }}>Email: info@smkn1pontianak.sch.id | Telp: (0561) 123456</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', textDecoration: 'underline', margin: 0 }}>LAPORAN REKAP STATISTIK BIMBINGAN KONSELING</h3>
          <p style={{ fontSize: '11px', margin: '4px 0 0 0', fontStyle: 'italic' }}>
            Periode Filter: {filterMonth !== "semua" ? `Bulan ${filterMonth}` : 'Semua Bulan'} | Tahun: {filterYear !== "semua" ? filterYear : 'Semua Tahun'} | Guru: {filterGuru !== "semua" ? filterGuru : 'Semua Guru'}
          </p>
          <p style={{ fontSize: '10px', color: '#666', margin: '2px 0 0 0' }}>Tanggal Cetak: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Cards Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard label="Total Konseling" value={stats.total} border="border-l-slate-400" color="text-slate-100" />
        <StatCard label="Menunggu" value={stats.menunggu} border="border-l-amber-500" color="text-amber-500" />
        <StatCard label="Diproses" value={stats.diproses} border="border-l-blue-500" color="text-blue-400" />
        <StatCard label="Selesai" value={stats.selesai} border="border-l-emerald-500" color="text-emerald-400" />
        <StatCard label="Ditolak" value={stats.ditolak} border="border-l-rose-500" color="text-rose-400" />
      </div>

      {/* Charts Grid (Hidden in print to optimize paper layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print-hidden">
        
        {/* Trend Area Chart */}
        <div className="dash-card">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-full"></span>
            Tren Konseling per Bulan
          </h4>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="name" fontSize={10} fontWeight="700" tickLine={false} tick={{fill: '#94a3b8'}} />
                <YAxis fontSize={10} fontWeight="700" tickLine={false} tick={{fill: '#94a3b8'}} />
                <Tooltip contentStyle={{borderRadius: '12px', background: '#0f172a', border: '1px solid #334155'}} />
                <Area type="monotone" dataKey="jumlah" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Problem Types Chart */}
        <div className="dash-card">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-teal-500 rounded-full"></span>
            Jenis Permasalahan Siswa
          </h4>
          <div className="h-[260px]">
            {categoryChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" fontSize={10} fontWeight="700" tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis fontSize={10} fontWeight="700" tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', background: '#0f172a', border: '1px solid #334155'}} />
                  <Bar dataKey="jumlah" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Counseling Status PieChart */}
        <div className="dash-card">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-indigo-500 rounded-full"></span>
            Proporsi Status Konseling
          </h4>
          <div className="h-[260px] flex items-center justify-center">
            {statusChartData.length === 0 ? (
              <div className="text-slate-500 text-xs">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '12px', background: '#0f172a', border: '1px solid #334155'}} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '11px', fontWeight: 'bold'}} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Most Active Guru BK */}
        <div className="dash-card">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-amber-500 rounded-full"></span>
            Guru BK Teraktif
          </h4>
          <div className="h-[260px]">
            {teacherChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={teacherChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                  <XAxis type="number" fontSize={10} fontWeight="700" tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis type="category" dataKey="name" fontSize={10} fontWeight="700" tickLine={false} tick={{fill: '#94a3b8'}} width={100} />
                  <Tooltip contentStyle={{borderRadius: '12px', background: '#0f172a', border: '1px solid #334155'}} />
                  <Bar dataKey="jumlah" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Majors Distribution */}
        <div className="dash-card lg:col-span-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <span className="w-1.5 h-3 bg-rose-500 rounded-full"></span>
            Distribusi Kasus Berdasarkan Jurusan Siswa
          </h4>
          <div className="h-[260px]">
            {majorChartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-slate-500 text-xs">Belum ada data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={majorChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" fontSize={10} fontWeight="700" tickLine={false} tick={{fill: '#94a3b8'}} />
                  <YAxis fontSize={10} fontWeight="700" tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip contentStyle={{borderRadius: '12px', background: '#0f172a', border: '1px solid #334155'}} />
                  <Bar dataKey="jumlah" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Recapitulation Table (Visible in Print, and clean scrollable in Screen) */}
      <div className="dash-card">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
          <span className="w-1.5 h-3 bg-slate-500 rounded-full"></span>
          Tabel Rekapitulasi Laporan Konseling
        </h4>
        <div className="overflow-x-auto">
          <table className="dash-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Siswa</th>
                <th>Kelas</th>
                <th>Guru BK</th>
                <th>Tanggal/Waktu</th>
                <th>Perihal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-slate-500 font-medium">Belum ada data kasus yang terfilter.</td>
                </tr>
              ) : (
                filteredData.map((k, index) => (
                  <tr key={k.id}>
                    <td className="font-mono text-xs text-slate-500">{index + 1}</td>
                    <td className="font-bold text-slate-200">{k.siswa?.name || "-"}</td>
                    <td>{k.siswa?.kelas || "-"}</td>
                    <td className="text-slate-300">{k.guru?.name || "-"}</td>
                    <td>{k.tanggal} / {k.waktu}</td>
                    <td className="text-xs text-slate-400 max-w-[200px] truncate" title={k.topik}>{k.topik || "-"}</td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        k.status === "Selesai" ? "bg-emerald-950/40 text-emerald-400" :
                        k.status.includes("Menunggu") ? "bg-amber-950/40 text-amber-400" :
                        k.status.includes("Dibatalkan") || k.status.includes("Ditolak") ? "bg-rose-950/40 text-rose-400" :
                        "bg-blue-950/40 text-blue-400"
                      }`}>{k.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Signature block for Printed Reports (Visible only in print) */}
      <div className="print-only mt-12 grid grid-cols-3 text-center text-xs" style={{ pageBreakInside: 'avoid' }}>
        <div>
          <p>Mengetahui,</p>
          <p className="font-bold">Kepala Sekolah SMKN 1</p>
          <div className="h-20"></div>
          <p className="font-bold text-decoration-line: underline">( Drs. H. Wardah, M.Pd. )</p>
          <p className="text-slate-500">NIP. 196803121995121002</p>
        </div>
        <div>
          <p>Menyetujui,</p>
          <p className="font-bold">Koordinator Guru BK</p>
          <div className="h-20"></div>
          <p className="font-bold text-decoration-line: underline">( Nuraini, S.Pd. )</p>
          <p className="text-slate-500">NIP. 197405202002122003</p>
        </div>
        <div>
          <p>Pontianak, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p className="font-bold">Petugas Pencetak Laporan</p>
          <div className="h-20"></div>
          <p className="font-bold text-decoration-line: underline">( ....................................... )</p>
          <p className="text-slate-500">Guru Bimbingan Konseling</p>
        </div>
      </div>

    </div>
  );
}

function StatCard({ label, value, border, color }) {
  return (
    <div className={`dash-card !p-5 border-l-4 ${border} !mb-0`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
    </div>
  );
}
