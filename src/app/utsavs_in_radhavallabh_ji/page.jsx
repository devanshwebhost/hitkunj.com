"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Radio, Clock, ChevronDown, ChevronUp, Loader2, PlayCircle, Info } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';

export default function AllUtsavsPage() {
    const { t, language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (data.success) {
        const processed = processAndSortEvents(data.data);
        setEvents(processed);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const processAndSortEvents = (allEvents) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const withStatus = allEvents.map(evt => {
        const startString = evt.startDate || evt.date;
        const endString = evt.endDate || evt.startDate || evt.date;
        
        if(!startString) return { ...evt, status: 'unknown' };

        const start = new Date(startString);
        const end = new Date(endString);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);

        let status = 'upcoming';
        if (today >= start && today <= end) status = 'running';
        else if (today > end) status = 'past';

        return { ...evt, status, startDateObj: start };
    });

    return withStatus.sort((a, b) => {
        if (a.status === 'running' && b.status !== 'running') return -1;
        if (b.status === 'running' && a.status !== 'running') return 1;
        return new Date(a.startDateObj) - new Date(b.startDateObj);
    });
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-amber-600 mb-2" size={40} />
            <p className="text-gray-500 font-bold">Utsav Load ho rahe hain...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="mb-8 mt-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-amber-600 transition mb-4 font-bold bg-white px-4 py-2 rounded-full shadow-sm">
            <ArrowLeft className="w-5 h-5 mr-2" /> {t('go_back')}
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-black mb-2">
            {t('Shri_Radhavallabh_Ji_Utsav')}
          </h1>
          <p className="text-gray-500 text-lg">{t('utsav_para')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => (
                <UtsavCard key={event.id} event={event} />
            ))}

            {events.length === 0 && (
                <div className="col-span-full text-center py-20 bg-white rounded-3xl border-dashed border-2 border-gray-300">
                    <p className="text-gray-400 text-xl font-bold">Abhi koi Utsav list nahi kiya gaya hai.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

function UtsavCard({ event }) {
    const [expanded, setExpanded] = useState(false);
    const isRunning = event.status === 'running';
    const isPast = event.status === 'past';

    const formatDate = (dateStr) => {
        if(!dateStr) return "";
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className={`
            relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl flex flex-col
            ${isRunning ? 'border-2 border-green-500 ring-4 ring-green-50' : isPast ? 'opacity-70 grayscale hover:grayscale-0' : 'border-t-4 border-blue-500'}
        `}>
            
            <div className="h-64 w-full relative overflow-hidden group">
                <img
                    src={event.image || '/logo-png.png'} 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    {isRunning && (
                        <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 animate-pulse shadow-lg">
                            <Radio size={12} /> ONGOING
                        </span>
                    )}
                    <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md ${isRunning ? 'bg-green-100 text-green-800' : 'bg-white/90 text-black'}`}>
                        {isRunning ? "Running Now" : isPast ? "Completed" : "Upcoming"}
                    </span>
                </div>

                <div className="absolute bottom-4 left-4 text-white">
                    <h2 className="text-2xl font-bold drop-shadow-md leading-tight">{event.title}</h2>
                </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <Calendar className={`w-5 h-5 ${isRunning ? 'text-green-600' : 'text-blue-600'}`} />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
                        <span className="text-sm font-bold text-gray-800">
                            {formatDate(event.startDate)}
                            {event.endDate && event.endDate !== event.startDate && ` - ${formatDate(event.endDate)}`}
                        </span>
                    </div>
                </div>

                <div className="mb-4 relative">
                    <p className={`text-gray-600 text-sm leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
                        {event.description || "No description available."}
                    </p>
                    
                    {event.description && event.description.length > 100 && (
                        <button 
                            onClick={() => setExpanded(!expanded)}
                            className="text-amber-600 text-xs font-bold mt-2 flex items-center gap-1 hover:underline"
                        >
                            {expanded ? <>Kam Dekhein <ChevronUp size={14}/></> : <>Aur Padhein (See More) <ChevronDown size={14}/></>}
                        </button>
                    )}
                </div>

                {/* ✅ BUTTON LOGIC CHANGED */}
                {/* Sirf tab dikhega agar LINK hai */}
                {event.link && (
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <a 
                            href={event.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition
                                ${isRunning 
                                    ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg' 
                                    : 'bg-black text-white hover:bg-gray-800'}
                            `}
                        >
                            {/* Text Changed: No more 'Darshan' */}
                            {isRunning ? <><PlayCircle size={16}/> Watch Video</> : <><Info size={16}/> Know More</>}
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}