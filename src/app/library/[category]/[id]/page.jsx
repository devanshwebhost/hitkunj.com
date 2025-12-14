"use client";
import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Volume2, StopCircle, Play, Pause, Share2, Music, AlertCircle, Info, Quote, Image as ImageIcon, Lightbulb } from 'lucide-react'; 
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLibraryData } from '@/hooks/useLibraryData';

// --- HELPER 1: Drive Link Converter ---
const getPlayableUrl = (url) => {
  if (!url) return null;
  if (url.includes('drive.google.com')) {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
  }
  return url;
};

// --- HELPER 2: ADVANCED PARSING LOGIC ---
const parseContentMixed = (text) => {
  if (!text) return [];
  const parts = text.split(/(\{\{[\s\S]*?\}\})/g);
  
  return parts.map((part, index) => {
    // 1. AUDIO
    if (part.startsWith('{{AUDIO:') && part.endsWith('}}')) {
      const content = part.slice(8, -2); 
      const [rawUrl, title, source] = content.split('|').map(s => s?.trim());
      return { type: 'embedded-audio', url: getPlayableUrl(rawUrl), title: title||'Audio', source: source||'Source', key: index };
    }
    // 2. VERSE
    if (part.startsWith('{{VERSE:') && part.endsWith('}}')) {
      const content = part.slice(8, -2);
      return { type: 'embedded-verse', content: content.trim(), key: index };
    }
    // 3. IMAGE
    if (part.startsWith('{{IMG:') && part.endsWith('}}')) {
      const content = part.slice(6, -2);
      const [url, caption, align] = content.split('|').map(s => s?.trim());
      return { type: 'embedded-img', url, caption, align: align || 'center', key: index };
    }
    // 4. NOTE
    if (part.startsWith('{{NOTE:') && part.endsWith('}}')) {
      const content = part.slice(7, -2);
      return { type: 'embedded-note', content: content.trim(), key: index };
    }
    // 5. Normal Text
    return { type: 'text', content: part, key: index };
  });
};

// --- Helper to parse Inline Highlights ---
const renderTextWithHighlights = (text) => {
  const parts = text.split(/(\{\{HIGHLIGHT:[\s\S]*?\}\})/g);
  return parts.map((part, i) => {
    if (part.startsWith('{{HIGHLIGHT:') && part.endsWith('}}')) {
      return <span key={i} className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium mx-1">{part.slice(12, -2)}</span>;
    }
    return <span key={i}>{part}</span>;
  });
};

// --- SUB-COMPONENTS ---
const EmbeddedPlayer = ({ url, title, source }) => {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);

  const toggle = () => {
    if (audioRef.current) {
      if (playing) audioRef.current.pause();
      else audioRef.current.play();
      setPlaying(!playing);
    }
  };

  return (
    <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 shadow-sm max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={toggle} className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-spiritual-amber text-black rounded-full hover:bg-amber-600 transition shadow-md">
          {playing ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <div className="flex-1">
          <h4 className="font-bold text-spiritual-dark text-lg leading-tight">{title}</h4>
          <button onClick={() => setShowInfo(!showInfo)} className="text-xs text-gray-500 hover:text-amber-600 flex items-center gap-1 underline decoration-dotted mt-1">
             <Info size={12} /> Source Info
          </button>
        </div>
      </div>
      <audio ref={audioRef} src={url} onEnded={() => setPlaying(false)} />
      {showInfo && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 pt-3 border-t border-amber-200 text-sm text-gray-600">
          <p className="mb-2"><span className="font-semibold">Source:</span> {source}</p>
          <a href={`mailto:contact@hitkunj.com?subject=Report Audio: ${title}`} className="flex items-center gap-2 text-red-500 hover:text-red-700 font-medium transition">
            <AlertCircle size={14} /> Report Issue
          </a>
        </motion.div>
      )}
    </div>
  );
};

const StyledVerse = ({ text }) => (
  <div className="my-8 px-4 md:px-10 py-8 bg-gray-50 border-l-4 border-spiritual-amber rounded-r-xl italic text-gray-700 text-lg md:text-xl text-center leading-loose font-serif relative shadow-sm">
    <Quote className="absolute top-3 left-3 text-spiritual-amber/20 w-8 h-8 transform rotate-180" />
    <div className="whitespace-pre-line relative z-10">{text}</div>
    <Quote className="absolute bottom-3 right-3 text-spiritual-amber/20 w-8 h-8" />
  </div>
);

const StyledImage = ({ url, caption, align }) => {
  let alignClass = "mx-auto"; 
  if (align === 'left') alignClass = "float-left mr-6 mb-4 max-w-[50%]";
  if (align === 'right') alignClass = "float-right ml-6 mb-4 max-w-[50%]";

  return (
    <div className={`my-6 clear-both md:clear-none ${alignClass} group`}>
      <img src={url} alt={caption} className="rounded-lg shadow-md border border-gray-100 w-full h-auto object-cover  transition duration-500" />
      {caption && <p className="text-center text-xs text-gray-500 mt-2 italic flex items-center justify-center gap-1"><ImageIcon size={12}/> {caption}</p>}
    </div>
  );
};

const StyledNote = ({ text }) => (
  <div className="my-8 p-6 bg-blue-50 border-l-4 border-blue-400 rounded-r-xl text-gray-800 text-base md:text-lg leading-relaxed relative shadow-sm">
     <div className="flex items-start gap-3">
        <Lightbulb className="text-blue-500 flex-shrink-0 mt-1" size={24} />
        <div className="whitespace-pre-wrap">{text}</div>
     </div>
  </div>
);

// --- NEW SKELETON LOADER COMPONENT ---
const DetailSkeleton = () => {
  return (
    <div className="animate-pulse w-full">
      {/* Hero Skeleton */}
      <div className="h-[45vh] w-full bg-gray-300 rounded-b-3xl mb-8 relative">
        <div className="absolute bottom-8 left-0 px-6 md:px-12 w-full max-w-6xl mx-auto">
           <div className="h-4 bg-gray-400 w-20 rounded mb-4"></div> {/* Back Button */}
           <div className="h-12 bg-gray-400 w-3/4 rounded mb-3"></div> {/* Title */}
           <div className="h-6 bg-yellow-300 w-24 rounded-full"></div> {/* Badge */}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-14">
        {/* Action Bar Skeleton */}
        <div className="h-20 bg-white rounded-2xl shadow-lg -mt-24 mb-10 mx-auto border border-gray-100"></div>

        {/* Content Skeleton */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-4">
           <div className="h-4 bg-gray-200 rounded w-full"></div>
           <div className="h-4 bg-gray-200 rounded w-5/6"></div>
           <div className="h-4 bg-gray-200 rounded w-full"></div>
           <div className="h-32 bg-gray-100 rounded-xl my-6"></div> {/* Verse/Image placeholder */}
           <div className="h-4 bg-gray-200 rounded w-11/12"></div>
           <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        </div>
      </div>
    </div>
  );
};

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const { category, id } = params;
  const { language } = useLanguage();
  const { speak, stop, isSpeaking } = useTextToSpeech();
  
  // Use Library Data Hook
  const { data: categoryData, loading } = useLibraryData(category);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  // --- LOGIC CHANGE: Loading check ab niche hoga ---
  // Pehle hum yahan return karte the, ab nahi karenge.

  let item = null;
  let mainAudioSource = null;
  let rawContent = "";
  let itemTitle = "";
  let parsedContent = [];

  // Agar Loading nahi hai, tabhi Data nikalenge
  if (!loading && categoryData && categoryData.items) {
     item = categoryData.items.find((i) => String(i.id) === String(id));
     if (item) {
        mainAudioSource = getPlayableUrl(item.audioUrl);
        rawContent = item.fullContent?.[language] || "Content not available.";
        itemTitle = item.title?.[language];
        parsedContent = parseContentMixed(rawContent);
     }
  }

  const handleReadAloud = () => {
    if (isSpeaking) {
      stop();
    } else {
      let cleanText = rawContent.replace(/\{\{[\s\S]*?\}\}/g, (match) => {
          if(match.startsWith('{{VERSE:')) return match.slice(8, -2);
          if(match.startsWith('{{NOTE:')) return match.slice(7, -2);
          if(match.startsWith('{{HIGHLIGHT:')) return match.slice(12, -2);
          return ''; 
      });
      speak(cleanText, language);
    }
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleShare = async () => {
    const shareData = { title: itemTitle, text: `Check out ${itemTitle}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(window.location.href); alert('Copied!'); }
    } catch (err) { console.log(err); }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar /> {/* Navbar Hamesha Dikhega */}
      
      {/* 1. LOADING STATE -> SHOW SKELETON */}
      {loading ? (
        <DetailSkeleton />
      ) : (
        /* 2. ERROR STATE -> Item Not Found */
        !item ? (
           <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
             <AlertCircle size={48} className="mb-4 opacity-50"/>
             <h2 className="text-xl font-semibold">Content Not Found</h2>
             <p>The item you are looking for doesn't exist.</p>
             <button onClick={() => router.back()} className="mt-6 text-spiritual-amber hover:underline">Go Back</button>
           </div>
        ) : (
          /* 3. SUCCESS STATE -> SHOW CONTENT */
          <>
            {/* Hero Section */}
            <div className="relative h-[45vh] w-full rounded-b-3xl overflow-hidden shadow-lg group">
              <img src={item.image} alt={itemTitle} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="absolute bottom-0 w-full px-6 md:px-12 pb-8">
                  <div className="max-w-6xl mx-auto">
                      <button onClick={() => router.back()} className="flex items-center text-white/80 hover:text-spiritual-amber mb-4 transition"><ArrowLeft className="w-5 h-5 mr-2" /> Back</button>
                      <h1 className="text-4xl md:text-6xl font-bold text-white mb-3 drop-shadow-xl">{itemTitle}</h1>
                      <span className="bg-spiritual-amber text-black bg-amber-500 text-xs font-bold px-3 py-1 rounded-full uppercase">{item.type}</span>
                  </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 mt-10 md:mt-14">
              
              {/* Action Bar */}
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 flex flex-wrap items-center justify-between gap-4 border border-gray-100 mb-10 -mt-16 relative z-10">
                <div className="flex flex-wrap gap-4">
                  {item.type === 'audio' ? (
                      mainAudioSource ? (
                          <button onClick={toggleAudio} className="flex items-center gap-2 px-6 py-3 rounded-full bg-spiritual-amber text-black font-semibold hover:bg-amber-500 transition-all shadow-md">
                              {isPlaying ? <Pause size={20} /> : <Play size={20} />} {isPlaying ? 'Pause' : 'Play'}
                          </button>
                      ) : null
                  ) : (
                      // <button onClick={handleReadAloud} className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all shadow-md ${isSpeaking ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-900'}`}>
                      //     {isSpeaking ? <StopCircle size={20} /> : <Volume2 size={20} />} {isSpeaking ? 'Stop' : 'Read Aloud'}
                      // </button>
                      <p className="text-gray-600 italic flex items-center gap-2"><Volume2 size={20} /> Text-to-Speech coming soon!</p>
                  )}
                  {mainAudioSource && <audio ref={audioRef} src={mainAudioSource} onEnded={() => setIsPlaying(false)} />}
                </div>
                <button onClick={handleShare} className="p-3 rounded-full text-gray-500 hover:bg-gray-100 border border-gray-200"><Share2 size={20} /></button>
              </div>

              {/* Content Block */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-8 md:p-16 rounded-3xl shadow-sm border border-gray-100 mb-12 relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none"><Music size={400} strokeWidth={0.5} /></div>
                
                <div className={`text-lg md:text-xl text-gray-800 leading-relaxed font-serif ${item.type === 'audio' ? 'text-center' : 'text-justify'}`}>
                  
                  {parsedContent.map((part) => {
                    if (part.type === 'embedded-audio') return <EmbeddedPlayer key={part.key} url={part.url} title={part.title} source={part.source} />;
                    if (part.type === 'embedded-verse') return <StyledVerse key={part.key} text={part.content} />;
                    if (part.type === 'embedded-img') return <StyledImage key={part.key} url={part.url} caption={part.caption} align={part.align} />;
                    if (part.type === 'embedded-note') return <StyledNote key={part.key} text={part.content} />;
                    return <span key={part.key} className="whitespace-pre-wrap">{renderTextWithHighlights(part.content)}</span>;
                  })}

                </div>
              </motion.div>

              <div className="text-center mt-8 mb-12 text-gray-500 text-sm">Jai Jai Shri Hit Harivansh</div>
            </div>
          </>
        )
      )}
    </div>
  );
}