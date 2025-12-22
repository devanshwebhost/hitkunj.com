"use client";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, Play, Pause, Share2, Check, ArrowDownCircle, 
  MousePointer2, Trash2, Music, Info, X 
} from "lucide-react";

export default function LibraryDetailClient({ preFetchedItem }) {
  const { language, t } = useLanguage(); 
  
  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Logic States
  const [pins, setPins] = useState([]); 
  const [currentPinIndex, setCurrentPinIndex] = useState(-1);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const [mouseY, setMouseY] = useState(0); 
  const [showTutorial, setShowTutorial] = useState(false);

  // Ref for the main container to calculate offset
  const containerRef = useRef(null);

  // Data Helpers
  const getData = (key) => {
    if (!preFetchedItem) return "";
    const flatKey = `${key}_${language}`;
    if (preFetchedItem[flatKey]) return preFetchedItem[flatKey];
    if (preFetchedItem[key] && preFetchedItem[key][language]) return preFetchedItem[key][language];
    if (preFetchedItem[`${key}_EN`]) return preFetchedItem[`${key}_EN`];
    if (preFetchedItem[key]?.EN) return preFetchedItem[key].EN;
    return "";
  };

  const title = getData("title");
  const mainContent = getData("content") || getData("fullContent") || getData("desc"); 
  const imageUrl = preFetchedItem?.image || "/logo-png.png";
  const audioUrl = preFetchedItem?.audioUrl || preFetchedItem?.url || "";

  // 1. Tutorial Check
  useEffect(() => {
    const hasSeen = localStorage.getItem('has_seen_tutorial');
    if (!hasSeen) setShowTutorial(true);
  }, []);

  const closeTutorial = () => {
      setShowTutorial(false);
      localStorage.setItem('has_seen_tutorial', "true");
      setIsPointerActive(true);
  };

  // 2. Mouse & Click Logic
  useEffect(() => {
    const handleMouseMove = (e) => {
        if (isPointerActive) setMouseY(e.clientY);
    };

    const handleGlobalClick = (e) => {
        if (isPointerActive && !e.target.closest('button') && !e.target.closest('a') && !e.target.closest('audio')) {
            const exactY = e.pageY; 
            setPins(prev => {
                const newPins = [...prev, exactY].sort((a, b) => a - b);
                return newPins;
            });
        }
    };

    if (isPointerActive) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleGlobalClick);
    }

    return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("click", handleGlobalClick);
    };
  }, [isPointerActive]);

  // 3. Navigation Loop
  const handleSmartNavigation = () => {
      if (pins.length > 0) {
          const nextIndex = (currentPinIndex + 1) % pins.length;
          setCurrentPinIndex(nextIndex);
          const targetY = pins[nextIndex];
          const offset = window.innerHeight / 2.5; 
          window.scrollTo({ top: targetY - offset, behavior: "smooth" });
      } else {
          window.scrollTo({ top: window.scrollY + 300, behavior: "smooth" });
      }
  };

  // Audio Logic
  useEffect(() => {
    if (audioUrl) {
      const newAudio = new Audio(audioUrl);
      newAudio.onended = () => setIsPlaying(false);
      setAudio(newAudio);
      return () => { newAudio.pause(); newAudio.src = ""; };
    }
  }, [audioUrl]);

  const toggleAudio = () => {
    if (!audio) return;
    if (isPlaying) audio.pause(); else audio.play();
    setIsPlaying(!isPlaying);
  };

  // ✅ FIXED SHARE FUNCTION (Native Share -> Clipboard -> Fallback)
  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
        title: title || "Library Item",
        text: "Check this out!",
        url: url,
    };

    // 1. Try Native Share (Best for Mobile)
    if (navigator.share) {
        try {
            await navigator.share(shareData);
            return; // Stop here if native share worked
        } catch (err) {
            console.log("Native share dismissed or failed", err);
        }
    }

    // 2. Try Modern Clipboard API (Best for Desktop)
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(url);
            setCopied(true);
        } else {
            throw new Error("Clipboard API unavailable");
        }
    } catch (err) {
        // 3. Old Fallback
        try {
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) setCopied(true);
            else alert("Failed to copy link");
        } catch (fallbackErr) {
            alert("Could not copy link manually");
        }
    } finally {
        setTimeout(() => setCopied(false), 2000);
    }
  };

  // Content Renderer
  const renderContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(\{\{[A-Z]+:[\s\S]+?\}\})/g);
    return parts.map((part, index) => {
        if (part.startsWith('{{') && part.endsWith('}}')) {
            const inner = part.slice(2, -2);
            const firstColonIndex = inner.indexOf(':');
            const tag = inner.substring(0, firstColonIndex);
            const content = inner.substring(firstColonIndex + 1);

            switch (tag) {
                case 'VERSE': return <div key={index} className="my-8 relative"><div className="absolute -top-4 -left-2 text-6xl text-amber-200 opacity-50 font-serif">“</div><div className="relative z-10 px-6 py-6 bg-amber-50/50 border-l-4 border-amber-400 rounded-r-xl"><p className="italic text-amber-900 font-serif text-center text-lg leading-relaxed whitespace-pre-line font-medium">{content.trim()}</p></div></div>;
                case 'NOTE': return <div key={index} className="my-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3 text-sm text-blue-900"><Info size={20} />{content}</div>;
                case 'HIGHLIGHT': return <span key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded font-medium">{content}</span>;
                case 'IMG': const [src, cap, align] = content.split('|'); return <div key={index} className={`my-6 flex flex-col ${align === 'center' ? 'items-center' : 'items-start'}`}><img src={src} className="rounded-xl shadow-md" /><span className="text-gray-500 text-xs mt-2">{cap}</span></div>;
                default: return null;
            }
        }
        return <span key={index}>{part}</span>;
    });
  };

  if (!preFetchedItem) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 text-black cursor-default relative overflow-x-hidden">
      
      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>
                    <motion.div animate={{ y: [0, 20, 0], x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mx-auto mb-4 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <MousePointer2 className="text-amber-600" size={24} />
                    </motion.div>
                    <h2 className="text-xl font-bold mb-2">Highlighter Tool</h2>
                    <p className="text-gray-600 mb-6 text-sm">Click anywhere to <span className="text-amber-600 font-bold">PIN</span> a line.<br/>Add multiple pins & use Resume Button.</p>
                    <button onClick={closeTutorial} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition">Start Reading</button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 1. MOVING RULER (Visual Only) */}
      {isPointerActive && (
        <div 
            className="fixed left-0 w-full h-6 pointer-events-none z-[40] bg-yellow-400/30 mix-blend-multiply"
            style={{ top: mouseY - 12 }} 
        />
      )}

      {/* 2. FIXED PINS */}
      {pins.map((pinY, index) => (
          <div 
            key={index}
            className={`absolute left-0 w-full h-7 z-[30] flex items-center px-4 transition-all duration-300 pointer-events-none
                ${currentPinIndex === index 
                    ? 'bg-amber-400/60 mix-blend-multiply' 
                    : 'bg-yellow-300/50 mix-blend-multiply' 
                }
            `}
            style={{ top: pinY - 14 }} 
          >
              <span className={`text-[10px] px-1.5 rounded-full ml-auto opacity-90 font-mono font-bold shadow-sm
                 ${currentPinIndex === index ? 'bg-black text-white' : 'bg-amber-600 text-white'}
              `}>
                  #{index + 1}
              </span>
          </div>
      ))}

      {/* Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full z-0">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-6 left-4 z-20">
           <Link href="/" className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition flex items-center gap-2"><ArrowLeft size={20} /></Link>
        </div>
        
        {/* ✅ FIX: Added pb-16 to create space for the controls that pull up via -mt-8 */}
        <div className="absolute bottom-0 left-0 w-full p-6 pb-16 md:pb-20 bg-gradient-to-t from-gray-900/80 to-transparent">
            <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-sm leading-tight">{title}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pb-32 relative z-10">
        <div className="sticky top-4 z-50 -mt-8 mb-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-3 flex flex-wrap items-center justify-between gap-3 border border-gray-200">
                {audioUrl ? (
                    <button onClick={toggleAudio} className="flex items-center gap-2 bg-black text-white px-4 py-2.5 rounded-lg font-bold hover:bg-gray-800 transition shadow-md flex-1 md:flex-none justify-center">
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        <span className="text-sm">{isPlaying ? "Pause" : "Listen"}</span>
                    </button>
                ) : <span className="text-gray-400 text-xs font-bold pl-2">{t ? t('audio_coming_soon') : 'Audio N/A'}</span>}
                <div className="flex gap-2">
                    <button onClick={() => setIsPointerActive(!isPointerActive)} className={`p-2.5 rounded-lg transition font-bold flex items-center gap-2 border shadow-sm ${isPointerActive ? 'bg-amber-100 text-amber-700 border-amber-300 ring-2 ring-amber-200' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                        <MousePointer2 size={20} />
                        {pins.length > 0 && <span className="bg-amber-600 text-white text-[10px] px-1.5 rounded-full">{pins.length}</span>}
                    </button>
                    {pins.length > 0 && <button onClick={() => { setPins([]); setCurrentPinIndex(-1); }} className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"><Trash2 size={20} /></button>}
                    
                    {/* Share Button */}
                    <button onClick={handleShare} className="p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-600 transition shadow-sm active:bg-gray-200">
                        {copied ? <Check className="text-green-600" size={20} /> : <Share2 size={20} />}
                    </button>
                </div>
            </div>
        </div>
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 text-lg leading-loose text-gray-800 whitespace-pre-wrap font-serif">
            {mainContent ? renderContent(mainContent) : <p className="text-center text-gray-400">Content unavailable.</p>}
        </div>
      </div>

      {/* Smart Button */}
      <AnimatePresence>
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-6 right-6 z-[60]">
            <button onClick={handleSmartNavigation} className="group bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 border-2 border-white/20">
                <ArrowDownCircle className={`group-hover:animate-bounce ${pins.length > 0 ? 'text-amber-400' : 'text-white'}`} size={24} />
                <div className="text-left flex flex-col leading-none">
                    <span className="text-[10px] uppercase tracking-wider opacity-80">{pins.length > 0 ? `Go to #${((currentPinIndex + 1) % pins.length) + 1}` : 'Scroll Down'}</span>
                    <span className="text-sm font-bold">{pins.length > 0 ? 'Next Highlight' : 'Resume Reading'}</span>
                </div>
            </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}