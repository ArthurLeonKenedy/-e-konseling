"use client";
import { useState, useEffect } from "react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Detect if already installed/running in standalone mode
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (isStandalone) {
      return;
    }

    // 2. Native PWA Installer Event (Android, Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 3. iOS Detection (iPhone/iPad/iPod)
    const ua = window.navigator.userAgent;
    const isIphone = /iPhone|iPod/.test(ua);
    const isIpad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    if ((isIphone || isIpad) && !isStandalone) {
      setIsIOS(true);
      const dismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!dismissed) {
        setIsVisible(true);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("User accepted PWA installation");
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismissClick = () => {
    sessionStorage.setItem("pwa_install_dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 z-[9999] animate-slide-up">
      <div 
        style={{
          background: "rgba(15, 23, 42, 0.96)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.6)"
        }}
        className="flex flex-col gap-4 text-white"
      >
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-inner">
            <img src="/logo-smkn1.jpg" alt="E-Konseling Logo" className="w-full h-full object-contain rounded" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm text-slate-100">Instal Aplikasi E-Konseling</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {isIOS 
                ? "Untuk memasang shortcut di iOS: Klik tombol Bagikan/Share (ikon kotak dengan panah ke atas) di Safari, lalu pilih 'Tambahkan ke Layar Utama' (Add to Home Screen)." 
                : "Pasang aplikasi di layar utama Anda untuk akses instan dan performa lebih cepat."
              }
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-1">
          <button 
            onClick={handleDismissClick}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Tutup
          </button>
          {!isIOS && deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              style={{ borderRadius: "10px", height: "36px" }}
              className="px-5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-emerald-950/30"
            >
              Instal Sekarang
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
