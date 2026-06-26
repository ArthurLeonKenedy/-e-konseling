"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import NotificationBanner from "../components/NotificationBanner";
import { apiFetch } from "../../lib/apiFetch";
import createEcho from "../../lib/echo";

function timeAgo(date) {
  if (!date) return "";
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " tahun yang lalu";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " bulan yang lalu";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " hari yang lalu";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " jam yang lalu";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " menit yang lalu";
  if (seconds < 10) return "baru saja";
  return Math.floor(seconds) + " detik yang lalu";
}

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("targetId");
  const targetName = searchParams.get("targetName");
  const targetRole = searchParams.get("targetRole");

  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState("siswa");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [lastSeen, setLastSeen] = useState(null);
  const messagesEndRef = useRef(null);
  const echoRef = useRef(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    setCurrentUserId(user.id);
    setCurrentUserRole(user.role || "siswa");
  }, []);

  const setupWebSocket = async (receiverId) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) return;

      const echo = createEcho(token);
      echoRef.current = echo;

      // Ping to update our own last_seen_at
      apiFetch('/api/ping', { method: 'POST' }).catch(()=>{});

      // Presence Channel
      echo.join('app')
        .here((users) => {
          const isOnline = users.find(u => u.id == receiverId);
          if (isOnline) setConnectionStatus("connected");
          else fetchLastSeen(receiverId);
        })
        .joining((user) => {
          if (user.id == receiverId) setConnectionStatus("connected");
        })
        .leaving((user) => {
          if (user.id == receiverId) {
            setConnectionStatus("disconnected");
            setLastSeen(new Date()); // They just left
          }
        });

      // Private Chat Channel
      echo.private(`chat.${currentUserId}`)
        .listen('MessageSent', (e) => {
          const newMsg = e.message;
          // Only show message if it's from the person we are chatting with
          if (newMsg.sender_id == receiverId) {
             setMessages((prev) => {
                if (prev.some(pm => pm.id === newMsg.id)) return prev;
                // Mark read
                apiFetch(`/api/chats/read`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ sender_id: receiverId }),
                }).catch(() => { });
                return [...prev, newMsg];
             });
          }
        });

    } catch (e) {
      console.error("WebSocket setup error", e);
    }
  };

  const fetchLastSeen = async (id) => {
    try {
      const res = await apiFetch(`/api/user-status/${id}`);
      const data = await res.json();
      if(data.success && data.data.last_seen_at) {
        setLastSeen(new Date(data.data.last_seen_at));
        setConnectionStatus("disconnected");
      }
    } catch(e) {}
  };

  useEffect(() => {
    if (!targetId || !targetName || !currentUserId) return;
    const loadInitialMessages = async () => {
      try {
        const response = await apiFetch(`/api/chats?receiver_id=${targetId}`);
        const data = await response.json();
        if (data.success) setMessages(data.data);
      } catch (error) { console.error(error); }
    };
    loadInitialMessages().then(() => {
      setupWebSocket(targetId);
    });
    return () => { 
      if (echoRef.current) {
        echoRef.current.leave('app');
        echoRef.current.leave(`chat.${currentUserId}`);
        echoRef.current.disconnect();
      }
    };
  }, [currentUserId, targetId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentUserId || isSending) return;
    const msgText = input.trim();
    setInput("");
    setIsSending(true);
    try {
      const response = await apiFetch(`/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender_id: currentUserId, receiver_id: targetId, message: msgText }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages(prev => prev.some(m => m.id === data.data.id) ? prev : [...prev, data.data]);
      } else { setInput(msgText); }
    } catch (e) { setInput(msgText); }
    finally { setIsSending(false); }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Premium Chat Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-100">
                {targetName?.charAt(0)}
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">{targetName}</h1>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {connectionStatus === 'connected' ? 'Aktif Sekarang' : (lastSeen ? `Terakhir dilihat: ${timeAgo(lastSeen)}` : 'Offline')}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em]">Layanan Enkripsi</span>
            <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </header>

      {/* Messages Scroll Area */}
      <main className="flex-1 overflow-y-auto px-6 py-10">
        <div className="max-w-3xl mx-auto flex flex-col gap-8">
          <NotificationBanner />

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-4xl mb-6">💬</div>
              <h3 className="text-xl font-bold text-slate-900">Mulai Percakapan</h3>
              <p className="text-sm text-slate-400 mt-2 max-w-xs">Silakan ketik pesan Anda untuk memulai sesi bimbingan bersama {targetName}.</p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.sender_id == currentUserId;
              const time = new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

              return (
                <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} animate-slide-up`} style={{ animationDelay: `${i * 50}ms` }}>
                  <div className={`group relative max-w-[85%] md:max-w-[75%] px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-sm transition-all ${isMe ? "bg-emerald-600 text-white rounded-br-none" : "bg-white text-slate-700 border border-slate-100 rounded-bl-none"
                    }`}>
                    {msg.message}
                  </div>
                  <div className={`flex items-center gap-2 mt-2 px-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{time}</span>
                    {isMe && (
                      <span className={`text-[10px] font-bold ${msg.is_read ? "text-emerald-500" : "text-slate-300"}`}>
                        {msg.is_read ? "Dibaca" : "Terkirim"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Modern Floating Input */}
      <footer className="p-6 bg-transparent">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={sendMessage} className="relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }}
              placeholder="Ketik pesan konsultasi Anda..."
              disabled={isSending}
              className="w-full bg-white border border-slate-200 rounded-[2rem] pl-8 pr-32 py-5 text-sm font-medium shadow-xl shadow-slate-200/40 text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none transition-all disabled:opacity-50"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:grayscale text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 transition-all flex items-center gap-2"
              >
                {isSending ? "..." : "Kirim"}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l7-7-7-7m7 7H5" /></svg>
              </button>
            </div>
          </form>
        </div>
      </footer>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <ChatContent />
    </Suspense>
  );
}
