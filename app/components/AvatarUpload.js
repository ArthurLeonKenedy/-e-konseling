"use client";

import { useState, useRef } from "react";
import { apiFetch } from "../../lib/apiFetch";

export default function AvatarUpload({ user, onUploadSuccess, size = "w-10 h-10", textSize = "text-xl", rounded = "rounded-xl", bg = "bg-gradient-to-br from-emerald-600 to-emerald-800" }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const fd = new FormData();
    fd.append('user_id', user.id);
    fd.append('photo', file);

    try {
      const httpRes = await apiFetch(`/api/update-profile`, { method: "POST", body: fd });
      // Wajib parse JSON terlebih dahulu
      const res = await httpRes.json();
      if (res.success) {
        const updatedUser = { ...user, photo: res.user.photo };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (onUploadSuccess) onUploadSuccess(updatedUser);
      } else {
        alert(res.message || "Gagal mengunggah foto.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan sistem saat mengunggah foto.");
    } finally {
      setIsUploading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const photoUrl = user?.photo ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${user.photo}` : null;

  return (
    <div 
      className={`relative group cursor-pointer ${size} ${rounded} ${bg} shadow-sm flex items-center justify-center text-white font-bold ${textSize} overflow-hidden`}
      onClick={() => fileInputRef.current?.click()}
    >
      {photoUrl ? (
        <img src={photoUrl} alt="Avatar" className="w-full h-full object-cover" />
      ) : (
        <span>{getInitials(user?.name)}</span>
      )}
      
      {/* Hover Overlay */}
      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity`}>
        {isUploading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />
    </div>
  );
}
