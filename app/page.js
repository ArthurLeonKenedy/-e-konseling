"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "./hooks/AuthContext";

export default function LoginPage() {
  const [role, setRole] = useState(null);
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");
  const [password, setPassword] = useState("");
  const [nisn, setNisn] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isForgotPassword) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://backend.ekonseling.smkn1pontianak.sch.id"}/api/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            role: role, 
            name: nama, 
            kelas: kelas, 
            nisn: nisn, 
            nip: nisn,
            new_password: password 
          }),
        });
        const data = await response.json();
        if (data.success) {
          toast.success(data.message);
          setIsForgotPassword(false);
          setPassword(""); setNisn("");
        } else {
          toast.error(data.message || "Gagal mengatur ulang kata sandi.");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan koneksi.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    const endpoint = role === "siswa" ? "login/siswa" : role === "guru" ? "login/guru" : "login/admin";
    const payload = { name: nama, password: password, ...(role === "siswa" && { kelas: kelas }) };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "https://backend.ekonseling.smkn1pontianak.sch.id"}/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        login(data.user, data.token);
        
        let redirectUrl = "";
        if (role === "siswa") {
          redirectUrl = `/siswa?nama=${encodeURIComponent(data.user.name)}&kelas=${encodeURIComponent(data.user.kelas)}`;
        } else if (role === "guru") {
          redirectUrl = `/guru?nama=${encodeURIComponent(data.user.name)}`;
        } else {
          redirectUrl = "/admin";
        }
        
        toast.success("Berhasil masuk!");
        router.push(redirectUrl);
      } else {
        toast.error(data.message || "Login gagal. Periksa kembali nama dan kata sandi Anda.");
      }
    } catch (error) {
      toast.error("Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="page">
      <div className="left">
        <div className="logo-row">
            <div className="logo-box" style={{ padding: '6px' }}>
                <img src="/logo-smkn1.jpg" alt="Logo SMKN 1 Pontianak" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="logo-text">
                <div className="title">E-Konseling</div>
                <div className="sub">SMK Negeri 1 Pontianak</div>
            </div>
        </div>

        <div className="left-headline">
            <h1>Platform<br/><em>Bimbingan Konseling</em><br/>Modern & Aman</h1>
            <p>Sistem informasi bimbingan konseling terpadu yang memfasilitasi komunikasi antara siswa dan guru BK secara efektif dan rahasia.</p>
        </div>


        <div className="left-foot">
            © {new Date().getFullYear()} SMK Negeri 1 Pontianak. All rights reserved. | BINA SARANA INFORMATIKA
        </div>
      </div>

      <div className="right">
        <div className="card">
            <div className="card-body text-center">
                <div className="card-brand">
                    <h2 className="card-title">
                        {isForgotPassword ? "Atur Ulang Sandi" : !role ? "Pilih Akses Masuk" : `Portal ${role.toUpperCase()}`}
                    </h2>
                    <p className="card-sub">
                        {!role ? "Silakan pilih peran Anda untuk melanjutkan" : "Silakan masukkan detail akun Anda"}
                    </p>
                </div>

                {!role ? (
                    <div className="mode-btns">
                        <button className="mode-btn" onClick={() => setRole("siswa")}>
                            <div className="mode-btn-icon">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                            </div>
                            <div className="mode-btn-content">
                                <div className="mode-btn-title">Siswa</div>
                                <div className="mode-btn-desc">Akses Layanan Konseling</div>
                            </div>
                            <div className="mode-btn-arrow">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>

                        <button className="mode-btn" onClick={() => setRole("guru")}>
                            <div className="mode-btn-icon">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <div className="mode-btn-content">
                                <div className="mode-btn-title">Guru BK</div>
                                <div className="mode-btn-desc">Manajemen & Penanganan</div>
                            </div>
                            <div className="mode-btn-arrow">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>

                        <button className="mode-btn" onClick={() => setRole("admin")}>
                            <div className="mode-btn-icon">
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 21a9.994 9.994 0 008.21-4.429m-8.387-5.482c-.311.163-.567.455-.733.811m4.83 7.9c.163-.311.455-.567.811-.733a4 4 0 011.192-.412C19.18 18.04 20 16.634 20 15V9a8 8 0 00-8-8c-4.418 0-8 3.582-8 8v6c0 1.634.82 3.04 2.03 3.937 1.144.846 2.03 2.103 2.03 3.563v.5" /></svg>
                            </div>
                            <div className="mode-btn-content">
                                <div className="mode-btn-title">Administrator</div>
                                <div className="mode-btn-desc">Konfigurasi Sistem</div>
                            </div>
                            <div className="mode-btn-arrow">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleLogin} className="text-left" style={{ animation: "fadeUp 0.4s ease both" }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
                            <button type="button" onClick={() => { if (isForgotPassword) setIsForgotPassword(false); else setRole(null); }} className="w-10 h-10 rounded-full bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center flex-shrink-0 border border-white/10">
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                            </button>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>
                                    {isForgotPassword ? "Atur Ulang Sandi" : `Portal ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                                </h3>
                                <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px', fontWeight: 500 }}>
                                    {isForgotPassword ? "Masukkan data untuk memverifikasi" : "Silakan login untuk melanjutkan"}
                                </p>
                            </div>
                        </div>

                        <div className="field">
                            <label className="flabel">Nama Lengkap</label>
                            <div className="input-group">
                                <div className="input-icon">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    className="finput with-icon"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                        </div>

                        {role === "siswa" && (
                            <div className="field">
                                <label className="flabel">Kelas</label>
                                <div className="input-group">
                                    <div className="input-icon">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={kelas}
                                        onChange={(e) => setKelas(e.target.value)}
                                        className="finput with-icon"
                                        placeholder="Cth: XII TKJ 2"
                                    />
                                </div>
                            </div>
                        )}

                        {isForgotPassword && role === "siswa" && (
                            <div className="field">
                                <label className="flabel">NISN (Verifikasi)</label>
                                <div className="input-group">
                                    <div className="input-icon">
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={nisn}
                                        onChange={(e) => setNisn(e.target.value)}
                                        className="finput with-icon"
                                        placeholder="10 digit NISN"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="field">
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px'}}>
                                <label className="flabel" style={{marginBottom: 0}}>{isForgotPassword ? "Sandi Baru" : "Kata Sandi"}</label>
                                {!isForgotPassword && (
                                    <button type="button" onClick={() => setIsForgotPassword(true)} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors bg-transparent border-none cursor-pointer p-0">
                                        Lupa Sandi?
                                    </button>
                                )}
                            </div>
                            <div className="input-group">
                                <div className="input-icon">
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="finput with-icon"
                                    placeholder="••••••••"
                                    style={{ paddingRight: '48px' }}
                                />
                                <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)} style={{position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s'}} title={showPassword ? "Sembunyikan" : "Tampilkan"}>
                                    {showPassword ? (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                    ) : (
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={isLoading} className="btn btn-green-theme" style={{marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px'}}>
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin" width="20" height="20" fill="none" viewBox="0 0 24 24" style={{ animation: 'spin 1s linear infinite' }}>
                                        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    {isForgotPassword ? "Simpan Perubahan" : "Masuk Sekarang"}
                                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
