"use client";
import { useState, useEffect } from 'react';
import { Calendar, Bell, User, CheckCircle, Loader2 } from 'lucide-react';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [userName, setUserName] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | subscribed
  const [loadingEvents, setLoadingEvents] = useState(true);

  // 1. Check Logic: Kya user pehle se subscribed hai?
  useEffect(() => {
    // Events fetch
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if(data.success) setEvents(data.data);
        setLoadingEvents(false);
      })
      .catch(() => setLoadingEvents(false));

    // Check Subscription Status
    if (typeof window !== "undefined" && window.OneSignalDeferred) {
      window.OneSignalDeferred.push(function(OneSignal) {
        if (OneSignal.User.PushSubscription.optedIn) {
          setStatus("subscribed"); // Agar pehle se on hai to form hide karo
        }
        
        // Listener: Agar Bell icon se subscribe kiya to ye box bhi update ho jaye
        OneSignal.User.PushSubscription.addEventListener("change", (event) => {
          if (event.current.optedIn) setStatus("subscribed");
        });
      });
    }
  }, []);

  // 2. Helper: Save to Sheet
  const saveUserToSheet = async (osId, name) => {
    if(!osId) return;
    try {
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: osId,      // ✅ ONLY OneSignal ID
          name: name, 
          action: 'subscribe',
          status: 'Subscribed' 
        })
      });
    } catch (err) { console.error("Sheet Error:", err); }
  };

  // 3. Handle Subscribe
  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!userName.trim()) return alert("Please enter your name.");
    
    // Name ko local storage me save karo taaki Bell icon dobara na puche
    localStorage.setItem('hitkunj_user_name', userName);
    setStatus("loading");

    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function(OneSignal) {
        try {
          // A. Permission Mango
          await OneSignal.Notifications.requestPermission();
          
          // B. Wait for ID (Sometimes ID takes a moment)
          // Hum OneSignal ID ka wait karenge
          const osId = OneSignal.User.PushSubscription.id;
          const isOptedIn = OneSignal.User.PushSubscription.optedIn;

          if (isOptedIn && osId) {
             // Success: ID mil gayi
             await saveUserToSheet(osId, userName);
             setStatus("success");
             setTimeout(() => setStatus("subscribed"), 2000); // 2 sec baad hide
          } else {
             // Permission Denied or ID not ready yet
             // Note: Agar ID turant nahi mili, to FloatingActions ka listener pakad lega
             setStatus("idle");
             alert("Notification permission allow karein taaki hum aapko jod sakein.");
          }

        } catch (err) {
          console.error("OS Error", err);
          setStatus("idle");
        }
      });
    }
  };

  // Agar user subscribed hai, to Box mat dikhao ya "Already Subscribed" dikhao
  const isSubscribed = status === "subscribed";

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
             <h3 className="text-3xl font-bold mb-2">
                {isSubscribed ? "Jay Ho! You are Connected." : "Get Utsav Alerts!"}
             </h3>
             <p className="text-gray-300 mb-8">
               {isSubscribed 
                 ? "Aapko notifications milte rahenge. Radha Radha!" 
                 : "Enter your name and allow notifications to get daily darshan reminders."}
             </p>

             {!isSubscribed && (
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
                     ${status === 'success' ? 'bg-green-600 text-white' : 'bg-amber-500 hover:bg-amber-600 text-black'}
                   `}
                 >
                   {status === 'loading' ? <><Loader2 className="animate-spin"/> Processing...</> : 
                    status === 'success' ? <><CheckCircle /> Subscribed!</> : 
                    <><Bell size={20}/> Enable Notifications</>}
                 </button>
               </form>
             )}
             
             {isSubscribed && (
                <div className="bg-white/10 p-4 rounded-xl text-center border border-green-500/30 text-green-300 font-bold flex items-center justify-center gap-2">
                    <CheckCircle /> Notifications Active
                </div>
             )}

             {!isSubscribed && (
                <p className="text-xs text-gray-500 text-center mt-6">
                 Click 'Allow' when the popup appears.
                </p>
             )}
           </div>
        </div>

      </div>
    </section>
  );
}