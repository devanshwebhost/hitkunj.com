"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLanguage } from '@/context/LanguageContext';
import { useLibraryData } from '@/hooks/useLibraryData';
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image"; // ✅ Next.js Image
import { 
  ArrowLeft, Play, Pause, Share2, Check, ArrowDownCircle, 
  MousePointer2, Trash2, Info, X, MapPin, 
  ChevronLeft, ChevronRight, List, Sparkles, ExternalLink
} from "lucide-react";

export default function LibraryDetailClient({ preFetchedItem }) {
  const { language, t } = useLanguage(); 
  const { data: libraryData } = useLibraryData();

  // Data Helpers
  const getData = (key, item = preFetchedItem) => {
    if (!item) return "";
    const flatKey = `${key}_${language}`;
    if (item[flatKey]) return item[flatKey];
    if (item[key] && item[key][language]) return item[key][language];
    if (item[`${key}_EN`]) return item[`${key}_EN`];
    if (item[key]?.EN) return item[key].EN;
    return "";
  };

  // --- 1. NEXT/PREV & SUGGESTIONS LOGIC ---
  const { folderItems, prevItem, nextItem, suggestions } = useMemo(() => {
    if (!libraryData || !preFetchedItem?.folder) return { folderItems: [], prevItem: null, nextItem: null, suggestions: [] };

    let allItems = [];
    Object.values(libraryData).forEach(cat => {
        if (cat.items) allItems.push(...cat.items);
    });

    // Folder Items (Sequence Sorted)
    const currentFolderItems = allItems.filter(i => i.folder === preFetchedItem.folder);
    currentFolderItems.sort((a, b) => (a.sequence || 9999) - (b.sequence || 9999));

    const currentIndex = currentFolderItems.findIndex(i => i.id === preFetchedItem.id);
    
    // ✅ SUGGESTIONS LOGIC:
    let related = currentFolderItems.filter(i => i.id !== preFetchedItem.id);
    
    if (related.length < 3) {
        const sameCategory = allItems.filter(i => i.category === preFetchedItem.category && i.id !== preFetchedItem.id && i.folder !== preFetchedItem.folder);
        related = [...related, ...sameCategory];
    }

    related = related.sort(() => 0.5 - Math.random()).slice(0, 4);

    return {
        folderItems: currentFolderItems,
        prevItem: currentIndex > 0 ? currentFolderItems[currentIndex - 1] : null,
        nextItem: currentIndex < currentFolderItems.length - 1 ? currentFolderItems[currentIndex + 1] : null,
        suggestions: related
    };
  }, [libraryData, preFetchedItem]);

  const itemId = preFetchedItem?.id || "unknown";
  const title = getData("title");
  const mainContent = getData("content") || getData("fullContent") || getData("desc"); 
  const imageUrl = preFetchedItem?.image || "/logo-png.png";
  const audioUrl = preFetchedItem?.audioUrl || preFetchedItem?.url || "";

  // --- STATES ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState(null);
  const [copied, setCopied] = useState(false);
  
  const [pins, setPins] = useState([]); 
  const [bookmark, setBookmark] = useState(null);
  const [isPointerActive, setIsPointerActive] = useState(false);
  const [mouseY, setMouseY] = useState(0); 
  const [showTutorial, setShowTutorial] = useState(false);
  const [showListModal, setShowListModal] = useState(false);

  const containerRef = useRef(null);

  // --- LOCAL STORAGE & INIT ---
  useEffect(() => {
    const savedPins = localStorage.getItem(`highlights_${itemId}`);
    const savedBookmark = localStorage.getItem(`bookmark_${itemId}`);
    if (savedPins) setPins(JSON.parse(savedPins));
    
    if (savedBookmark) {
        const bmValue = JSON.parse(savedBookmark);
        setBookmark(bmValue);
        setTimeout(() => {
            if (containerRef.current) {
                window.scrollTo({ top: bmValue + containerRef.current.offsetTop - (window.innerHeight / 3), behavior: "smooth" });
            }
        }, 500);
    }
    const hasSeen = localStorage.getItem('has_seen_tutorial');
    if (!hasSeen) setShowTutorial(true);
  }, [itemId]);

  useEffect(() => {
    if (pins.length > 0) localStorage.setItem(`highlights_${itemId}`, JSON.stringify(pins));
    else localStorage.removeItem(`highlights_${itemId}`);
  }, [pins, itemId]);

  useEffect(() => {
    if (bookmark !== null) localStorage.setItem(`bookmark_${itemId}`, JSON.stringify(bookmark));
  }, [bookmark, itemId]);

  const closeTutorial = () => {
      setShowTutorial(false);
      localStorage.setItem('has_seen_tutorial', "true");
      setIsPointerActive(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => { if (isPointerActive) setMouseY(e.clientY); };
    const handleGlobalClick = (e) => {
        if (isPointerActive && !e.target.closest('button') && !e.target.closest('a') && !e.target.closest('audio') && containerRef.current) {
            const containerOffset = containerRef.current.offsetTop;
            setPins(prev => [...prev, e.pageY - containerOffset].sort((a, b) => a - b));
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

  const removePin = (e, index) => { e.stopPropagation(); setPins(prev => prev.filter((_, i) => i !== index)); };

  const handleSetBookmark = () => {
      if (!containerRef.current) return;
      const relativeY = window.scrollY - containerRef.current.offsetTop + (window.innerHeight / 3);
      setBookmark(relativeY);
      alert("📍 Bookmark Set!");
  };

  const removeBookmark = (e) => { e.stopPropagation(); setBookmark(null); localStorage.removeItem(`bookmark_${itemId}`); };

  const handleSmartNavigation = () => {
      if (pins.length === 0) { window.scrollTo({ top: window.scrollY + 300, behavior: "smooth" }); return; }
      if (containerRef.current) {
          const containerOffset = containerRef.current.offsetTop;
          const nextPin = pins.find(pin => (pin + containerOffset) > (window.scrollY + (window.innerHeight / 2.5) + 10));
          let targetY = nextPin ? (nextPin + containerOffset) : (pins[0] + containerOffset);
          window.scrollTo({ top: targetY - (window.innerHeight / 2.5), behavior: "smooth" });
      }
  };

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

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = { title: title || "Library Item", text: "Check this out!", url: url };
    if (navigator.share) { try { await navigator.share(shareData); return; } catch (err) {} }
    try { await navigator.clipboard.writeText(url); setCopied(true); } catch (err) {} 
    finally { setTimeout(() => setCopied(false), 2000); }
  };

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
                case 'IMG': 
                   const [src, cap, align] = content.split('|'); 
                   return (
                     <div key={index} className={`my-6 flex flex-col ${align === 'center' ? 'items-center' : 'items-start'}`}>
                       {/* ✅ FIX 1: Added Width/Height and Style for Responsive Content Images */}
                       <Image 
                         src={src} 
                         alt={cap || "Hitkunj Library Image"} 
                         width={800} // Default width prevent error
                         height={500} // Default height prevent error
                         style={{ width: '100%', height: 'auto' }} // Maintains aspect ratio
                         className="rounded-xl shadow-md max-w-2xl object-cover" 
                         loading="lazy" 
                       />
                       {cap && <span className="text-gray-500 text-xs mt-2 italic">{cap}</span>}
                     </div>);
                default: return null;
            }
        }
        return <span key={index}>{part}</span>;
    });
  };

  if (!preFetchedItem) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 text-black cursor-default relative">
      
      {/* 1. LIST MODAL */}
      <AnimatePresence>
        {showListModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex justify-end">
                <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
                    <div className="sticky top-0 bg-white/95 backdrop-blur z-10 p-4 border-b flex justify-between items-center">
                        <div><h3 className="font-bold text-lg">Index</h3><p className="text-xs text-gray-500">{folderItems.length} items</p></div>
                        <button onClick={() => setShowListModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                    </div>
                    <div className="p-4 space-y-3">
                        {folderItems.map((item, idx) => {
                            const active = item.id === preFetchedItem.id;
                            const itemTitle = getData("title", item);
                            return (
                                <Link href={`/library/${item.category}/${item.id}`} key={item.id} onClick={() => setShowListModal(false)} className={`flex items-center gap-3 p-3 rounded-xl border transition hover:shadow-md ${active ? 'bg-amber-50 border-amber-400' : 'bg-gray-50 border-gray-100'}`}>
                                    {/* ✅ FIX 2: Added 'relative' to parent and 'fill' to Image */}
                                    <div className="relative w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                                        <Image 
                                            src={item.image || "/logo-png.png"} 
                                            alt={itemTitle}
                                            fill
                                            sizes="48px"
                                            className="object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1"><h4 className={`font-bold text-sm line-clamp-2 ${active ? 'text-amber-700' : 'text-gray-800'}`}>{itemTitle}</h4><span className="text-[10px] text-gray-400 font-mono">#{idx + 1}</span></div>
                                    {active && <div className="w-2 h-2 rounded-full bg-amber-500"></div>}
                                </Link>
                            )
                        })}
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial, Rulers, Pins, Bookmarks */}
      <AnimatePresence>
        {showTutorial && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"><div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center relative overflow-hidden"><div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div><h2 className="text-xl font-bold mb-4 mt-2">Tools Guide</h2><p className="text-gray-600 mb-6 text-sm">Use Next/Prev & Index buttons to navigate.</p><button onClick={closeTutorial} className="w-full bg-amber-500 text-white font-bold py-3 rounded-xl">Got it</button></div></motion.div>}
      </AnimatePresence>
      {isPointerActive && <div className="fixed left-0 w-full h-6 pointer-events-none z-[40] bg-yellow-400/30 mix-blend-multiply" style={{ top: mouseY - 12 }} />}
      {pins.map((pinY, index) => <div key={index} className="absolute left-0 w-full h-7 z-[30] flex items-center px-4 pointer-events-auto bg-yellow-300/50 mix-blend-multiply border-b border-yellow-500/20 group" style={{ top: pinY - 14 }}><button onClick={(e) => removePin(e, index)} className="bg-white text-red-500 p-1 rounded-full shadow-md scale-0 group-hover:scale-100 transition"><X size={12} strokeWidth={3} /></button></div>)}
      {bookmark !== null && <div className="absolute left-0 w-full z-[35] flex items-center pointer-events-auto" style={{ top: bookmark - 16 }}><div className="absolute left-2 text-red-600 animate-bounce"><MapPin size={32} className="drop-shadow-lg" /></div><div className="w-full h-1 bg-red-500/50 shadow-glow"></div><button onClick={removeBookmark} className="absolute right-4 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">Pin <X size={12}/></button></div>}

      {/* Header */}
      <div className="relative h-[40vh] md:h-[50vh] w-full z-0">
        {/* Background Image doesn't strictly need next/image if it's dynamic CSS, but keeping standard is fine */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${imageUrl})` }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-6 left-4 z-20"><Link href="/lab" className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition flex items-center gap-2"><ArrowLeft size={20} /></Link></div>
        <div className="absolute bottom-0 left-0 w-full p-6 pb-16 md:pb-20 bg-gradient-to-t from-gray-900/80 to-transparent"><h1 className="text-xl md:text-5xl font-black text-white drop-shadow-sm leading-tight">{title}</h1></div>
      </div>

      {/* Main Content */}
      <div className="max-w-[95%] mx-auto px-4 pb-32 relative">
        <div className="sticky top-16 z-[100] -mt-8 mb-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-2 md:p-3 flex flex-col md:flex-row items-center justify-between gap-3 border border-gray-200">
                <div className="flex items-center gap-2 w-full md:w-auto bg-gray-100/50 p-1 rounded-xl">
                    {prevItem ? <Link href={`/library/${prevItem.category}/${prevItem.id}`} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-amber-50 text-gray-700 hover:text-amber-700 flex-1 flex justify-center"><ChevronLeft size={20} /></Link> : <div className="p-2 flex-1"></div>}
                    <button onClick={() => setShowListModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border hover:bg-black hover:text-white transition font-bold text-sm"><List size={16} /> <span className="hidden sm:inline">Index</span></button>
                    {nextItem ? <Link href={`/library/${nextItem.category}/${nextItem.id}`} className="p-2 bg-white rounded-lg shadow-sm border hover:bg-amber-50 text-gray-700 hover:text-amber-700 flex-1 flex justify-center"><ChevronRight size={20} /></Link> : <div className="p-2 flex-1"></div>}
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-center w-full md:w-auto">
                    {audioUrl && <button onClick={toggleAudio} className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition shadow-md text-sm">{isPlaying ? <Pause size={16} /> : <Play size={16} />}<span className="hidden sm:inline">{isPlaying ? "Pause" : "Listen"}</span></button>}
                    <button onClick={() => setIsPointerActive(!isPointerActive)} className={`p-2 rounded-lg transition border shadow-sm ${isPointerActive ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-white text-gray-600 border-gray-200'}`}><MousePointer2 size={18} /></button>
                    <button onClick={handleSetBookmark} className="p-2 bg-white text-red-500 border border-gray-200 rounded-lg hover:bg-red-50 transition shadow-sm"><MapPin size={18} /></button>
                    {pins.length > 0 && <button onClick={() => setPins([])} className="p-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100"><Trash2 size={18} /></button>}
                    <button onClick={handleShare} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-gray-600 transition shadow-sm">{copied ? <Check className="text-green-600" size={18} /> : <Share2 size={18} />}</button>
                </div>
            </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 text-lg leading-loose text-gray-800 whitespace-pre-wrap font-serif">
            {mainContent ? renderContent(mainContent) : <p className="text-center text-gray-400">Content unavailable.</p>}
        </div>

        {/* ✅ SUGGESTIONS SECTION FIX */}
        {suggestions.length > 0 && (
            <div className="mt-16 border-t pt-10">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
                    <Sparkles className="text-amber-500" /> {language === 'HI' ? "अन्य सुझाव" : "You May Also Like"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {suggestions.map((sItem) => {
                         const sTitle = getData("title", sItem);
                         return (
                             <Link href={`/library/${sItem.category}/${sItem.id}`} key={sItem.id} className="group flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-amber-200 transition">
                                 {/* ✅ FIX 3: Added 'relative' to parent and 'fill' to Image */}
                                 <div className="relative w-20 h-20 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                                     <Image 
                                         src={sItem.image || "/logo-png.png"} 
                                         alt={sTitle}
                                         fill
                                         sizes="80px"
                                         className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                     />
                                 </div>
                                 <div className="flex-1 flex flex-col justify-center">
                                     <h4 className="font-bold text-gray-900 line-clamp-2 group-hover:text-amber-700 transition">{sTitle}</h4>
                                     <span className="text-xs text-gray-400 mt-1 flex items-center gap-1">Read Now <ExternalLink size={10}/></span>
                                 </div>
                             </Link>
                         );
                    })}
                </div>
            </div>
        )}
      </div>

      {/* Floating Action Buttons */}
      <AnimatePresence>
        <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-6 right-6 z-[60]">
            <button onClick={handleSmartNavigation} className="group bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full shadow-2xl flex items-center gap-3 transition border-2 border-white/20">
                <ArrowDownCircle className={`group-hover:animate-bounce ${pins.length > 0 ? 'text-amber-400' : 'text-white'}`} size={24} />
                <div className="text-left flex flex-col leading-none">
                    <span className="text-[10px] uppercase tracking-wider opacity-80">{pins.length > 0 ? `Go to Next` : 'Scroll Down'}</span>
                    <span className="text-sm font-bold">{pins.length > 0 ? 'Next Highlight' : 'Scroll Page'}</span>
                </div>
            </button>
        </motion.div>
      </AnimatePresence>

       {bookmark !== null && <div onClick={() => containerRef.current && window.scrollTo({ top: bookmark + containerRef.current.offsetTop - (window.innerHeight/3), behavior: 'smooth' })} className="fixed bottom-24 right-6 z-[50] bg-red-600 text-white p-3 rounded-full shadow-xl cursor-pointer hover:scale-110 transition animate-pulse" title="Go to Pinned Location"><MapPin size={20} fill="currentColor"/></div>}
    </div>
  );
}