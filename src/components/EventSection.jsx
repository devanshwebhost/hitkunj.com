"use client";
import { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';

export default function EventSection() {
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => {
        if(data.success) setEvents(data.data);
        setLoadingEvents(false);
      })
      .catch(() => setLoadingEvents(false));
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12 mb-10">
      {/* Grid hata kar single column kar diya */}
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
           // Grid for Events Cards
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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
    </section>
  );
}