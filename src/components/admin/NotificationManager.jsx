"use client";
import { useState } from "react";
import { Send, Clock, Globe, Loader2, Calendar } from "lucide-react";

export default function NotificationManager() {
  const [notif, setNotif] = useState({ title: "", message: "", url: "", schedule: "" });
  const [loading, setLoading] = useState(false);

  const handleSend = async (isScheduled = false) => {
    const { title, message, url, schedule } = notif;

    // Validation
    if(!title || !message) return alert("Title and Message required!");
    if(isScheduled && !schedule) return alert("Please select a date and time to schedule!");

    setLoading(true);
    
    try {
      // 1. Send / Schedule API Call
      const res = await fetch("/api/send-notification", {
        method: "POST",
        body: JSON.stringify({
          title,
          message,
          url,
          // Agar Scheduled hai to Date bhejo, warna null
          scheduleDate: isScheduled ? new Date(schedule).toISOString() : null
        })
      });

      // 2. Save to History (Sheet)
      // Hum scheduled notifications ko bhi history me save kar sakte hain status ke sath
      if(res.ok) {
          await fetch("/api/notifications/save", {
            method: "POST",
            body: JSON.stringify({ 
                title, 
                message, 
                url, 
                status: isScheduled ? "Scheduled" : "Sent" 
            })
          });
      }

      const data = await res.json();
      
      if(data.success) {
        alert("🚀 Success! Notification " + (isScheduled ? "Scheduled for Later" : "Sent Instantly"));
        setNotif({ title: "", message: "", url: "", schedule: "" }); // Reset Form
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
        <BellIcon /> Push Notifications
      </h2>
      
      <div className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-bold text-black mb-1">Headline</label>
          <input 
            className="w-full p-4 bg-gray-50 border rounded-xl text-black focus:ring-2 focus:ring-amber-500 outline-none" 
            placeholder="e.g. Naya Pad Gayan Upload Hua!" 
            value={notif.title} 
            onChange={e => setNotif({...notif, title: e.target.value})} 
          />
        </div>

        {/* Message Input */}
        <div>
          <label className="block text-sm font-bold text-black mb-1">Message Body</label>
          <textarea 
            className="w-full p-4 bg-gray-50 border rounded-xl text-black h-32 focus:ring-2 focus:ring-amber-500 outline-none" 
            placeholder="Message details yahan likhein..." 
            value={notif.message} 
            onChange={e => setNotif({...notif, message: e.target.value})} 
          />
        </div>

        {/* URL Input */}
        <div>
          <label className="block text-sm font-bold text-black mb-1 flex items-center gap-2">
            <Globe size={16}/> Target URL (Optional)
          </label>
          <input 
            className="w-full p-4 bg-gray-50 border rounded-xl text-black focus:ring-2 focus:ring-amber-500 outline-none" 
            placeholder="https://hitkunj.com/library/..." 
            value={notif.url} 
            onChange={e => setNotif({...notif, url: e.target.value})} 
          />
        </div>

        {/* --- SCHEDULE SECTION --- */}
        <div className="pt-4 border-t border-gray-100 mt-4">
            <label className="block text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
                <Calendar size={18}/> Schedule for Later (Optional)
            </label>
            <input 
                type="datetime-local"
                className="w-full p-3 border-2 border-amber-100 bg-amber-50 rounded-xl text-black cursor-pointer"
                value={notif.schedule}
                onChange={e => setNotif({...notif, schedule: e.target.value})}
            />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
            {/* Instant Button */}
            <button 
                disabled={loading}
                onClick={() => handleSend(false)}
                className="flex-1 bg-black text-white p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-lg"
            >
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Send Now</>}
            </button>

            {/* Schedule Button */}
            <button 
                disabled={loading || !notif.schedule}
                onClick={() => handleSend(true)}
                className={`flex-1 p-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition shadow-lg border-2
                    ${!notif.schedule 
                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                        : 'bg-white text-amber-600 border-amber-500 hover:bg-amber-50'}
                `}
            >
                {loading ? <Loader2 className="animate-spin" /> : <><Clock size={20} /> Schedule</>}
            </button>
        </div>

      </div>
    </div>
  );
}

function BellIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bell"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
    )
}