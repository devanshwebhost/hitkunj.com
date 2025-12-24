"use client";
import { useState } from "react";
import { Send, Globe, Loader2, Bell } from "lucide-react";

export default function NotificationManager() {
  const [notif, setNotif] = useState({ title: "", message: "", url: "" });
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const { title, message, url } = notif;

    if(!title || !message) return alert("Title and Message required!");

    setLoading(true);
    
    try {
      // ✅ CHANGED: Correct API endpoint
      const res = await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          url,
        })
      });

      const data = await res.json();
      
      if(data.success) {
        // "Sent to X subscribers" wala message ab sahi dikhega
        alert(data.message); 
        setNotif({ title: "", message: "", url: "" });
      } else {
        alert("Error: " + (data.error || "Failed"));
      }

    } catch (err) { 
        console.error(err);
        alert("Error processing request"); 
    } finally { 
        setLoading(false); 
    }
  };

  return (
    <div className="max-w-2xl bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
      <h2 className="text-3xl font-extrabold text-black mb-6 flex items-center gap-2">
        <Bell /> Push Notifications
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-black mb-1">Headline</label>
          <input 
            className="w-full p-4 bg-gray-50 border rounded-xl text-black outline-none focus:ring-2 focus:ring-amber-400" 
            placeholder="e.g. Naya Pad Gayan Upload Hua!" 
            value={notif.title} 
            onChange={e => setNotif({...notif, title: e.target.value})} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1">Message Body</label>
          <textarea 
            className="w-full p-4 bg-gray-50 border rounded-xl text-black h-32 outline-none focus:ring-2 focus:ring-amber-400" 
            placeholder="Message details..." 
            value={notif.message} 
            onChange={e => setNotif({...notif, message: e.target.value})} 
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1 flex items-center gap-2">
            <Globe size={16}/> Target URL (Optional)
          </label>
          <input 
            className="w-full p-4 bg-gray-50 border rounded-xl text-black outline-none focus:ring-2 focus:ring-amber-400" 
            placeholder="https://hitkunj.com/library/..." 
            value={notif.url} 
            onChange={e => setNotif({...notif, url: e.target.value})} 
          />
        </div>

        <button 
            disabled={loading}
            onClick={handleSend}
            className="w-full bg-black text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg mt-6"
        >
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Send Now</>}
        </button>
      </div>
    </div>
  );
}