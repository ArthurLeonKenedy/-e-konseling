"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "../../../lib/apiFetch";
import createEcho from "../../../lib/echo";

export default function InboxManagement() {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch('/api/chats/conversations');
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    
    // Auto refresh periodically to ensure sync if websockets disconnect
    const interval = setInterval(fetchConversations, 15000);

    // Setup Echo for real-time updates
    const token = localStorage.getItem("api_token");
    let echo = null;
    
    if (token) {
        const user = JSON.parse(localStorage.getItem("user"));
        echo = createEcho(token);
        if (echo && user) {
            echo.private(`chat.${user.id}`)
              .listen('MessageSent', () => {
                  fetchConversations(); // refetch on new message
              });
        }
    }

    return () => {
      clearInterval(interval);
      if (echo) echo.disconnect();
    };
  }, []);

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hr yg lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam yg lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mnt yg lalu";
    if (seconds < 10) return "baru saja";
    return Math.floor(seconds) + " dtk yg lalu";
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="dash-card overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Kotak Masuk (Chat)</h3>
            <p className="text-xs text-slate-400 mt-0.5">Daftar pesan langsung dengan siswa</p>
          </div>
        </div>
        
        <div className="p-2">
          {isLoading && conversations.length === 0 ? null : conversations.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mb-4">📭</div>
              <h4 className="text-slate-900 font-bold">Belum ada pesan</h4>
              <p className="text-sm text-slate-400 mt-1">Siswa belum ada yang mengirimkan pesan ke Anda.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <Link
                  key={conv.user.id}
                  href={`/chat?targetId=${conv.user.id}&targetName=${encodeURIComponent(conv.user.name)}&targetRole=${conv.user.role}`}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors group relative"
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center cursor-pointer overflow-hidden border border-emerald-100">
                      {conv.user.photo ? (
                        <img src={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/storage/${conv.user.photo}`} className="w-full h-full object-cover" />
                      ) : conv.user.name.charAt(0)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className={`font-bold truncate ${conv.unread_count > 0 ? 'text-slate-900' : 'text-slate-700'}`}>
                        {conv.user.name}
                      </h4>
                      <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap ml-2 ${conv.unread_count > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {timeAgo(conv.latest_message.created_at)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
                        {conv.latest_message.sender_id === conv.user.id ? '' : 'Anda: '}
                        {conv.latest_message.message}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
