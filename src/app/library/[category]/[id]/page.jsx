"use client";
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, StopCircle, Play, Pause, Share2, Music } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLibraryData } from '@/hooks/useLibraryData';

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const { category, id } = params;
  const { language } = useLanguage();

  const { speak, stop, isSpeaking } = useTextToSpeech();

  // Dynamic Data Fetch
  const { data: categoryData, loading } = useLibraryData(category);

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // Loading phase
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading...
      </div>
    );
  }

  // Data Validation
  if (!categoryData) return <div className="p-10 text-center">Category Not Found</div>;
  
  // Note: Ensure ID comparison handles string/number mismatch
  const item = categoryData.items.find((i) => String(i.id) === String(id));

  if (!item) return <div className="p-10 text-center">Item Not Found</div>;

  const contentText = item.fullContent?.[language] || "Content not available.";
  const itemTitle = item.title?.[language];

  // Audio Play/Pause Logic
  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* HERO IMAGE */}
      <div className="relative h-[45vh] w-full rounded-b-3xl overflow-hidden shadow-lg">
        <img 
          src={item.image} 
          alt={itemTitle} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        <div className="absolute bottom-0 w-full px-6 md:px-12 pb-8">
          <div className="max-w-4xl mx-auto">
            <button 
              onClick={() => router.back()} 
              className="flex items-center text-white/80 hover:text-yellow-400 mb-4 transition"
            >
              <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>

            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-4xl md:text-6xl font-bold text-white mb-3 drop-shadow-xl"
            >
              {itemTitle}
            </motion.h1>

            <span className="inline-block bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {item.type}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-4xl mx-auto px-4 mt-10 md:mt-14">

        {/* --- ACTION BAR (CHANGED Logic Here) --- */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 border border-gray-200 mb-10 -mt-16">
          
          <div className="flex flex-wrap gap-4">

            {/* LOGIC: Agar 'audio' type hai, to PLAYER dikhao. Agar 'biography' hai to READ ALOUD dikhao. */}
            
            {item.type === 'audio' ? (
              // === OPTION A: AUDIO PLAYER (For Pad Gayan) ===
              item.audioUrl ? (
                <button 
                  onClick={toggleAudio}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition-all shadow-md"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  {isPlaying ? 'Pause Bhajan' : 'Play Bhajan'}
                </button>
              ) : (
                <div className="text-red-500 text-sm py-3 px-2 font-medium">Audio coming soon...</div>
              )
            ) : (
              // === OPTION B: READ ALOUD (For Sant Charitra) ===
              <button 
                onClick={() => isSpeaking ? stop() : speak(contentText, language)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-md ${
                  isSpeaking 
                    ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' 
                    : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-100'
                }`}
              >
                {isSpeaking ? <StopCircle size={20} /> : <Volume2 size={20} />}
                {isSpeaking ? 'Stop Reading' : 'Read Aloud'}
              </button>
            )}

            {/* Hidden Audio Element (Connected to Google Sheet URL) */}
            {item.audioUrl && (
              <audio ref={audioRef} src={item.audioUrl} onEnded={() => setIsPlaying(false)} />
            )}

          </div>

          <button className="p-3 rounded-full text-gray-500 hover:bg-gray-100 transition border border-gray-200">
            <Share2 size={20} />
          </button>
        </div>

        {/* CONTENT BLOCK */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-12 rounded-2xl shadow-sm border border-gray-100 mb-12 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
             <Music size={300} strokeWidth={0.5} />
          </div>

          <div className="text-5xl text-spiritual-gold font-serif opacity-30 mb-4 text-center">“</div>

          {/* Poem Style vs Paragraph Style Logic */}
          <div className={`
             text-lg md:text-2xl text-gray-800 leading-loose font-serif
             ${item.type === 'audio' ? 'text-center whitespace-pre-line' : 'text-justify whitespace-pre-wrap'}
          `}>
            {contentText}
          </div>

          <div className="text-5xl text-spiritual-gold font-serif opacity-30 text-center mt-4">”</div>
          
          {item.type === 'audio' && (
             <div className="text-center mt-6 text-spiritual-amber font-bold text-sm tracking-widest uppercase">
                — {itemTitle}
             </div>
          )}
        </motion.div>

        <div className="text-center mt-8 mb-12 text-gray-500 text-sm tracking-wide">
          Jai Jai Shri Hit Harivansh • Radha Vallabh Shri Harivansh
        </div>

      </div>
    </div>
  );
}