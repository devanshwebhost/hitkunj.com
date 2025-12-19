"use client";
import { useState, useEffect } from 'react';
import { Calendar, Bell, User, CheckCircle, Loader2 } from 'lucide-react';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState("idle");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [userId, setUserId] = useState(null);

  // 1. Fetch Events & Generate UserID
  useEffect(() => {
    // A. Events Fetch
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if(data.success) setEvents(data.data);
        setLoadingEvents(false);
      })
      .catch(() => setLoadingEvents(false));

    // B. User ID Logic (Duplicate rokne ke liye)
    let storedId = localStorage.getItem('hitkunj_uid');
    if (!storedId) {
      storedId = crypto.randomUUID(); // Browser me unique ID banao
      localStorage.setItem('hitkunj_uid', storedId);
    }
    setUserId(storedId);

  }, []);

  // 2. Helper: Save User to Sheet (Updated)
  const saveUserToSheet = async (name, subStatus) => {
      if(!userId) return; // ID hona zaroori hai

      try {
        await fetch('/api/save-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                userId: userId,      // ✅ Unique ID bhejo
                name: name, 
                action: 'subscribe', // ✅ Batao ki ye subscribe action hai
                status: subStatus 
            })
        });
      } catch (err) {
          console.error("Sheet Save Error:", err);
      }
  };

  // 3. Handle Subscribe
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!userName.trim()) return alert("Please enter your name.");
    
    setStatus("loading");

    if (typeof window === "undefined") return;

    window.OneSignalDeferred = window.OneSignalDeferred || [];
    
    window.OneSignalDeferred.push(async function(OneSignal) {
        try {
            console.log("OneSignal Requesting Permission...");
            await OneSignal.Notifications.requestPermission();
            
            const permission = OneSignal.Notifications.permission;
            
            if (permission) { 
                // ✅ Permission Granted
                await saveUserToSheet(userName, 'Subscribed (Notification ON)');
                setStatus("success");
                setUserName(""); // Form clear
                
                // Optional: Tag User in OneSignal
                // OneSignal.login(userId); 
            } else {
                // ❌ Permission Denied
                await saveUserToSheet(userName, 'Denied (User Blocked)');
                alert("Notifications are blocked by your browser settings.");
                setStatus("success");
                setUserName("");
            }

        } catch (err) {
            console.error("OneSignal Error:", err);
            await saveUserToSheet(userName, 'Error: Logic Failed');
            setStatus("success");
            setUserName("");
        }
    });
    
    // Safety Timeout
    setTimeout(() => {
        if (status === 'loading') {
             saveUserToSheet(userName, 'Timeout: Script Blocked');
             setStatus("success");
             setUserName("");
        }
    }, 5000);
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* --- LEFT: Upcoming Events (Same as before) --- */}
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
               Enter your name and allow notifications to get daily darshan reminders.
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
                  disabled={status === 'loading'}
                  className={`py-4 rounded-full font-bold text-lg shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2
                    ${status === 'success' ? 'bg-green-600 text-white cursor-default' : 'bg-amber-500 hover:bg-amber-600 text-black'}
                  `}
                >
                  {status === 'loading' ? <><Loader2 className="animate-spin"/> Processing...</> : 
                   status === 'success' ? <><CheckCircle /> Saved!</> : 
                   <><Bell size={20}/> Enable Notifications</>}
                </button>
             </form>
             
             <p className="text-xs text-gray-500 text-center mt-6">
               Note: Click 'Allow' when the popup appears.
             </p>
           </div>
        </div>

      </div>
    </section>
  );
}