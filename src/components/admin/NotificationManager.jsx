"use client";
import { useState } from "react";
import { Send, Clock, Globe } from "lucide-react";

export default function NotificationManager() {
  const [notif, setNotif] = useState({ title: "", message: "", url: "", schedule: "" });
  const [loading, setLoading] = useState(false);

  const handleSend = async (isScheduled = false) => {
    if(!notif.title || !notif.message) return alert("Title and Message required!");
    setLoading(true);
    
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({
          ...notif,
          scheduleDate: isScheduled ? new Date(notif.schedule).toISOString() : null
        })
      });
      const data = await res.json();
      if(data.success) alert("🚀 Success! Notification " + (isScheduled ? "Scheduled" : "Sent"));
    } catch (err) { alert("Error sending notification"); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
      <h2 className="text-3xl font-extrabold text-black mb-6">Push Notifications</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-black mb-1">Headline</label>
          <input className="w-full p-4 bg-gray-50 border rounded-xl text-black" placeholder="e.g. Naya Pad Gayan Upload Hua!" value={notif.title} onChange={e => setNotif({...notif, title: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1">Message Body</label>
          <textarea className="w-full p-4 bg-gray-50 border rounded-xl text-black h-32" placeholder="Message details yahan likhein..." value={notif.message} onChange={e => setNotif({...notif, message: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-bold text-black mb-1 flex items-center gap-2"><Globe size={16}/> Target URL (Optional)</label>
          <input className="w-full p-4 bg-gray-50 border rounded-xl text-black" placeholder="https://hitkunj.com/library/..." value={notif.url} onChange={e => setNotif({...notif, url: e.target.value})} />
        </div>

        <div className="pt-6 border-t mt-6">
          <label className="block text-sm font-bold text-black mb-2 flex items-center gap-2"><Clock size={16}/> Schedule for Later</label>
          <div className="flex flex-col md:flex-row gap-4">
            <input type="datetime-local" className="flex-1 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl text-black" onChange={e => setNotif({...notif, schedule: e.target.value})} />
            <button 
              disabled={loading || !notif.schedule}
              onClick={() => handleSend(true)}
              className="bg-amber-500 text-white px-8 py-4 rounded-xl font-bold hover:bg-amber-600 disabled:opacity-50"
            >
              Schedule
            </button>
          </div>
        </div>

        <button 
          disabled={loading}
          onClick={() => handleSend(false)}
          className="w-full bg-black text-white p-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 hover:bg-gray-800 transition shadow-xl mt-4"
        >
          {loading ? "Sending..." : <><Send /> Send Notification Now</>}
        </button>
      </div>
    </div>
  );
}