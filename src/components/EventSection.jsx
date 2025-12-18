"use client";
import { useState, useEffect } from 'react';
import { Calendar, Bell, User, CheckCircle, Loader2 } from 'lucide-react';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [loadingEvents, setLoadingEvents] = useState(true);

  // 1. Fetch Events
  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if(data.success) setEvents(data.data);
        setLoadingEvents(false);
      })
      .catch(err => setLoadingEvents(false));
  }, []);

  // 2. Save User to Sheet (Helper Function)
  const saveUserToSheet = async (name, subStatus) => {
      try {
        const res = await fetch('/api/save-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, status: subStatus })
        });
        const data = await res.json();
        if(!data.success) throw new Error(data.error);
        return true;
      } catch (err) {
          console.error("Sheet Save Error:", err);
          return false;
      }
  };

  // 3. Handle Subscribe Logic
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!userName.trim()) return alert("Kripya apna naam likhein (Please enter name).");
    
    setStatus("loading");

    if (typeof window !== "undefined") {
      window.OneSignal = window.OneSignal || [];
      
      // ✅ FIX: Push method use karein taaki OneSignal load hone ka wait kare
      window.OneSignal.push(async function() {
        try {
            // Check if already subscribed
            const isPushSupported = window.OneSignal.Notifications.isPushSupported();
            
            if (!isPushSupported) {
                alert("Notifications are not supported on this browser.");
                setStatus("idle");
                return;
            }

            // Ask Permission
            // Note: Modern OneSignal uses 'requestPermission', fallback to 'Slidedown' if configured
            let permission = Notification.permission;
            
            if (permission === 'default') {
                await window.OneSignal.Slidedown.promptPush();
                // Wait a moment for user interaction logic inside OneSignal internals
                // But we can check permission again after a delay or rely on event listeners.
                // For simplicity, we assume if code continues, we try to save.
            }

            // Re-check permission after prompt
            permission = Notification.permission;

            if (permission === 'granted') {
                const saved = await saveUserToSheet(userName, 'Subscribed (Permission Given)');
                if(saved) {
                    setStatus("success");
                    setUserName("");
                    // 3 sec baad wapas normal
                    setTimeout(() => setStatus("idle"), 3000);
                } else {
                    alert("Notification on ho gaya, par Sheet me save nahi hua. API check karein.");
                    setStatus("error");
                }
            } else if (permission === 'denied') {
                await saveUserToSheet(userName, 'Denied (Blocked)');
                alert("Aapne notifications block kar di hain. Browser settings se allow karein.");
                setStatus("idle");
            } else {
                // Dismissed or Default
                setStatus("idle");
            }

        } catch (err) {
            console.error("OneSignal Error:", err);
            // Fallback: Agar OneSignal fail ho jaye, tab bhi naam save kar lo
            await saveUserToSheet(userName, 'Error in OneSignal (Saved Anyway)');
            setStatus("success");
            setUserName("");
            setTimeout(() => setStatus("idle"), 3000);
        }
      });
    } else {
      alert("Window not found.");
      setStatus("idle");
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* --- LEFT: Upcoming Events --- */}
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6 overflow-hidden relative">
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 to-orange-500"></div>
           <h3 className="text-2xl font-bold text-spiritual-dark mb-6 flex items-center gap-2">
             <Calendar className="text-amber-600" /> Upcoming Utsavs
           </h3>

           {loadingEvents ? (
             <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                <Loader2 className="animate-spin mb-2 text-amber-500" /> Loading events...
             </div>
           ) : events.length === 0 ? (
             <div className="text-center py-10 bg-amber-50 rounded-xl border border-dashed border-amber-200 text-gray-500 italic">
               No upcoming events listed currently.
             </div>
           ) : (
             <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
               {events.map((event) => (
                 <div key={event.id} className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-amber-50 transition border border-gray-100">
                    <div className="w-16 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                       <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                    <div>
                       <h4 className="font-bold text-gray-800 text-lg">{event.title}</h4>
                       <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded inline-block mb-1">
                         {event.date}
                       </span>
                       <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>

        {/* --- RIGHT: Subscribe Box --- */}
        <div className="bg-gradient-to-br from-spiritual-dark to-black text-white rounded-2xl shadow-2xl p-8 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-[-20%] right-[-10%] opacity-10">
              <Bell size={200} />
           </div>

           <div className="relative z-10">
             <h3 className="text-3xl font-bold mb-2">Get Utsav Alerts!</h3>
             <p className="text-gray-300 mb-8">
               Allow notifications to get daily darshan and event reminders directly on your device.
             </p>

             <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Enter your Name" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={status === 'loading' || status === 'success'}
                  className={`py-4 rounded-full font-bold text-lg shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2
                    ${status === 'success' ? 'bg-green-600 text-white cursor-default' : 'bg-amber-500 hover:bg-amber-600 text-black'}
                    ${status === 'error' ? 'bg-red-500 text-white' : ''}
                  `}
                >
                  {status === 'loading' ? <><Loader2 className="animate-spin"/> Processing...</> : 
                   status === 'success' ? <><CheckCircle /> Saved Successfully!</> : 
                   status === 'error' ? 'Try Again' : 
                   <><Bell size={20}/> Enable Notifications</>}
                </button>
             </form>
             
             <p className="text-xs text-gray-500 text-center mt-6">
               Note: A popup will appear asking for permission. Click 'Allow'.
             </p>
           </div>
        </div>

      </div>
    </section>
  );
}