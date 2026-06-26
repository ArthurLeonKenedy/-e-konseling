"use client";
import { useState, useEffect, useRef } from "react";

export default function Chat({ currentUserRole, currentUserName, targetName, targetRole, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadMessages = () => {
      const stored = localStorage.getItem("chatMessages");
      if (stored) {
        let allMessages = JSON.parse(stored);
        let updated = false;

        // Filter messages for this conversation and mark as read if we are the receiver
        const filtered = allMessages.filter(msg => {
          const isThisConversation = (msg.senderName === currentUserName && msg.receiverName === targetName) ||
                                     (msg.senderName === targetName && msg.receiverName === currentUserName);
          
          if (isThisConversation && msg.receiverName === currentUserName && !msg.isRead) {
            msg.isRead = true;
            updated = true;
          }
          return isThisConversation;
        });

        if (updated) {
          localStorage.setItem("chatMessages", JSON.stringify(allMessages));
        }
        setMessages(filtered);
      }
    };
    loadMessages();

    window.addEventListener("storage", loadMessages);
    const interval = setInterval(loadMessages, 1000);

    return () => {
      window.removeEventListener("storage", loadMessages);
      clearInterval(interval);
    };
  }, [currentUserName, targetName]);

  useEffect(() => {
    // Scroll to bottom when new message arrives
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      senderRole: currentUserRole,
      senderName: currentUserName,
      receiverName: targetName,
      receiverRole: targetRole,
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    const stored = localStorage.getItem("chatMessages");
    const allMessages = stored ? JSON.parse(stored) : [];
    const updatedAllMessages = [...allMessages, newMessage];
    
    localStorage.setItem("chatMessages", JSON.stringify(updatedAllMessages));
    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-5">
      {/* Header */}
      <div className="bg-indigo-500/20 border-b border-indigo-500/20 p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xs">
            {targetName?.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">
              {targetName}
            </h3>
            <p className="text-[10px] text-white/70 capitalize">{targetRole}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages Area */}
      <div className="h-80 p-4 overflow-y-auto bg-slate-950/50 flex flex-col gap-3">
        {messages.length === 0 ? (
          <div className="text-center text-sm text-slate-500 mt-10">
            Belum ada pesan dengan {targetName}.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderName === currentUserName;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm shadow-sm ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-800 text-slate-200 border border-white/5 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {msg.timestamp}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-3 bg-slate-900/50 border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ketik pesan..." 
          className="flex-1 px-3 py-2 bg-slate-950/80 border border-white/5 rounded-xl text-sm outline-none focus:ring-1 focus:ring-indigo-500 text-white"
        />
        <button 
          type="submit"
          disabled={!input.trim()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          Kirim
        </button>
      </form>
    </div>
  );
}
