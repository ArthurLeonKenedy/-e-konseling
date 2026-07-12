"use client";
import NotificationBanner from "../../components/NotificationBanner";
import AvatarUpload from "../../components/AvatarUpload";

export default function DashboardHeader({ namaGuru, user, onUpdateUser }) {
  return (
    <div className="space-y-6">
      <div style={{background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)', borderRadius: '12px', padding: '1px', boxShadow: '0 8px 32px rgba(5, 150, 105, 0.35)'}}>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 p-6" style={{borderRadius: '11px'}}>
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 shadow-xl flex items-center justify-center p-0.5 rounded-xl" style={{background: 'rgba(255,255,255,0.2)'}}>
              <AvatarUpload user={user} onUploadSuccess={onUpdateUser} size="w-full h-full" rounded="rounded-lg" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight" style={{color: '#ffffff'}}>Halo, {namaGuru}</h2>
              <p className="text-sm font-bold uppercase tracking-widest mt-1" style={{color: 'rgba(255,255,255,0.8)'}}>Dashboard Bimbingan & Konseling</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl text-xs font-extrabold" style={{background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', color: '#ffffff', backdropFilter: 'blur(8px)'}}>
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background: '#86efac', boxShadow: '0 0 8px rgba(134,239,172,0.8)'}} />
            SISTEM ONLINE
          </div>
        </div>
      </div>
      <NotificationBanner />
    </div>
  );
}

