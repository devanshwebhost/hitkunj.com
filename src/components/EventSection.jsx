"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Loader2, Radio, ArrowRight, MapPin } from 'lucide-react';

export default function EventSection() {
  const [featuredEvent, setFeaturedEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(resData => {
        if(resData.success && resData.data.length > 0) {
            findPriorityEvent(resData.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const findPriorityEvent = (allEvents) => {
      const today = new Date();
      // Aaj ka time shuruwat (00:00:00) se set karein taaki comparison sahi ho
      today.setHours(0, 0, 0, 0);

      const runningList = [];
      const upcomingList = [];

      allEvents.forEach(evt => {
          const startString = evt.startDate || evt.date;
          const endString = evt.endDate || evt.startDate || evt.date;

          if(!startString) return;

          const start = new Date(startString);
          const end = new Date(endString);
          
          // START Date: Din ki shuruwat (Subah 00:00:00)
          start.setHours(0,0,0,0);
          
          // END Date: Din ka anth (Raat 23:59:59)
          // ✅ YAHAN HAI MAIN LOGIC: Isse event last date ke end tak active rahega
          end.setHours(23,59,59,999);

          // Logic: Agar aaj ki date Start aur End ke beech mein hai (End date included)
          if (today >= start && today <= end) {
              runningList.push({ ...evt, status: 'running' });
          } else if (today < start) {
              upcomingList.push({ ...evt, status: 'upcoming' });
          }
      });

      // LOGIC: Pehle Running dikhao, agar nahi hai to Next Upcoming
      if (runningList.length > 0) {
          // Sort Running: Jo event jaldi khatam hone wala hai use pehle dikhayein
          runningList.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
          setFeaturedEvent(runningList[0]);
      } else if (upcomingList.length > 0) {
          // Sort Upcoming: Jo event sabse paas hai use pehle dikhayein
          upcomingList.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          setFeaturedEvent(upcomingList[0]);
      }
  };

  if (loading) return null; // Loading state hide karein
  if (!featuredEvent) return null; // Agar koi event nahi hai to hide karein

  const isLive = featuredEvent.status === 'running';

  return (
    <section className="max-w-6xl mx-auto px-4 py-8 mb-10">
      
      {/* Container */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative group cursor-pointer transition-all hover:shadow-2xl">
         
         {/* Top Gradient Line */}
         <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${isLive ? 'from-red-500 to-amber-500' : 'from-blue-500 to-indigo-500'}`}></div>
         
         {/* --- MAIN CARD CONTENT (Link to All Utsavs) --- */}
         <Link href="/utsavs_in_radhavallabh_ji" className="block p-6 md:p-8">
            
            <div className="flex flex-col md:flex-row gap-8 items-center">
                
                {/* 1. Image Section */}
                <div className="w-full md:w-1/3 relative">
                    <div className="aspect-video md:aspect-square rounded-2xl overflow-hidden shadow-md">
                        <img 
                            src={featuredEvent.image || '/logo-png.png'} 
                            alt={featuredEvent.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        />
                    </div>
                    {/* Live Badge */}
                    {isLive && (
                        <div className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse shadow-lg border border-white">
                            <Radio size={12} /> Running
                        </div>
                    )}
                </div>

                {/* 2. Text Content */}
                <div className="flex-1 w-full text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                        <Calendar className={`w-5 h-5 ${isLive ? 'text-amber-600' : 'text-blue-600'}`} />
                        <span className={`text-sm font-bold uppercase tracking-wider ${isLive ? 'text-amber-600' : 'text-blue-600'}`}>
                            {isLive ? "Aaj ka Utsav (Today's Event)" : "Aane Wala Utsav (Upcoming)"}
                        </span>
                    </div>

                    <h3 className="text-3xl md:text-4xl font-black text-black mb-3 leading-tight">
                        {featuredEvent.title}
                    </h3>
                    
                    <p className="text-lg text-gray-600 mb-6 font-medium bg-gray-50 inline-block px-4 py-2 rounded-lg border border-gray-200">
                        📅 {new Date(featuredEvent.startDate || featuredEvent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                        {featuredEvent.endDate && featuredEvent.endDate !== (featuredEvent.startDate || featuredEvent.date) && 
                            ` - ${new Date(featuredEvent.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}`
                        }
                    </p>

                    <p className="text-gray-500 line-clamp-2 md:line-clamp-3 mb-6 max-w-2xl">
                        {featuredEvent.description || "Shri Radhavallabh Lal Ji ke darbar mein hone wala vishesh utsav."}
                    </p>

                    <div className="inline-flex items-center gap-2 text-black font-bold border-b-2 border-black pb-1 hover:text-amber-600 hover:border-amber-600 transition">
                        Pura Utsav Dekhein aur Anya Tyohar Janein <ArrowRight size={18} />
                    </div>
                </div>

            </div>
         </Link>

      </div>
    </section>
  );
}