"use client";
import NotificationBanner from "../../components/NotificationBanner";
import AvatarUpload from "../../components/AvatarUpload";

export default function DashboardHeader({ namaGuru, user, onUpdateUser }) {
  return (
    <div className="space-y-6">
      <div className="dash-card p-1 overflow-hidden border-none bg-white/40 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 p-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 shadow-xl flex items-center justify-center p-0.5 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800">
              <AvatarUpload user={user} onUploadSuccess={onUpdateUser} size="w-full h-full" rounded="rounded-xl" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Halo, {namaGuru}</h2>
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mt-1">Dashboard Bimbingan & Konseling</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white border border-emerald-100 shadow-sm text-xs font-extrabold text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            SISTEM ONLINE
          </div>
        </div>
      </div>
      <NotificationBanner />
    </div>
  );
}
