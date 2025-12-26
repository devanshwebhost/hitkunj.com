"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useLibraryData } from '@/hooks/useLibraryData';
import { 
  BookOpen, Plus, X, Trash2, CheckCircle, 
  ArrowRight, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- HELPER 1: Slugify ---
const slugify = (text) =>
  text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-') || '';

// --- HELPER 2: Formatter ---
const formatFolderName = (text) => {
  if (!text) return "";
  return text.toString().replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

export default function NityaPath() {
  const { data: allContent, loading } = useLibraryData();
  const { userData, addToRoutine, removeFromRoutine, getProgress, updateReadingProgress } = useUser();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('folders'); 
  const [selectedFolderSlug, setSelectedFolderSlug] = useState(null);
  const [targetPopup, setTargetPopup] = useState(null); 
  const [targetInput, setTargetInput] = useState(11);

  const myRoutine = userData.nityaNiyam || [];

  // --- 1. DATA PROCESSING ---
  const derivedFolders = useMemo(() => {
    if (!allContent) return {};
    const folderMap = {};
    Object.values(allContent).forEach((category) => {
      if (category?.items && Array.isArray(category.items)) {
        category.items.forEach((item) => {
          if (item.folder) {
            const rawEN = item.folder.trim();
            const slug = slugify(rawEN);
            if (!folderMap[slug]) {
              folderMap[slug] = {
                id: slug,
                name_EN: formatFolderName(rawEN),
                items: [],
                image: null
              };
            }
            folderMap[slug].items.push(item);
            if (!folderMap[slug].image && item.image) folderMap[slug].image = item.image;
          }
        });
      }
    });
    return folderMap;
  }, [allContent]);

  // --- Handlers ---
  const openAddPopup = (id, max, type, title, parentSlug = null) => {
    setTargetInput(11);
    setTargetPopup({ id, max, type, title, parentSlug });
  };

  const confirmAdd = () => {
    if (!targetPopup) return;
    let val = Number(targetInput);
    if (val < 1) val = 1;
    if (val > targetPopup.max) val = targetPopup.max;

    addToRoutine({
      id: targetPopup.id,
      type: targetPopup.type,
      target: val,
      title: targetPopup.title,
      parentFolder: targetPopup.parentSlug
    });
    setTargetPopup(null);
    setShowModal(false);
  };

  // --- LOGIC: Handle "Read" Click ---
  const handleReadClick = (item, url, indexJustRead) => {
    if (url === '#') return false; 
    
    const progress = getProgress(item.id);
    
    // Check Daily Goal
    if (progress.dailyCount >= item.target) {
       if(!confirm(`✅ आज का नियम (${item.target}) पूरा हो गया है!\nक्या आप और पढ़ना चाहते हैं?`)) return false;
    }

    // Update Progress
    // We update 'lastIndex' to the index of the item we are *about to read*
    // So next time, (lastIndex + 1) will point to the *next* one.
    updateReadingProgress(item.id, { 
        dailyCount: progress.dailyCount + 1, 
        lastIndex: indexJustRead 
    });
    return true;
  };

  // --- SAFE LINK GENERATOR ---
  const getSafeLinkData = (routineItem) => {
      const fallback = {
          url: '#',
          image: null,
          title: routineItem.title || "Unknown Folder",
          nextItemName: "Loading...",
          isReady: false
      };

      if (!derivedFolders || Object.keys(derivedFolders).length === 0) return fallback;

      if (routineItem.type === 'folder') {
          const folderData = derivedFolders[routineItem.id];
          if (!folderData) return { ...fallback, nextItemName: "Folder Missing" };

          // ✅ FIX: Index Logic
          const progress = getProgress(routineItem.id);
          
          // lastIndex = index of item we FINISHED reading.
          // Start with -1 (finished nothing).
          // Next item to read = lastIndex + 1.
          let lastIdx = progress.lastIndex;
          if (lastIdx === undefined) lastIdx = -1; // Default
          
          let nextIndex = lastIdx + 1;

          // Loop back if finished
          if (nextIndex >= folderData.items.length) nextIndex = 0;
          
          const nextItem = folderData.items[nextIndex];
          
          // Safety Check
          if (!nextItem) return { ...fallback, title: folderData.name_EN, nextItemName: "Empty (0 Items)", isReady: true };

          // URL Construction
          const catUrl = (nextItem.category || 'uncategorized').toLowerCase().replace(/\s+/g, '-');
          const itemId = nextItem.id || 0; 

          return {
             url: `/library/${catUrl}/${itemId}`,
             image: folderData.image,
             title: folderData.name_EN,
             nextItemName: nextItem.title?.Hi || nextItem.title?.en || `Pad ${nextIndex + 1}`,
             isReady: true,
             indexToRead: nextIndex // Pass this to handler
          };
      } 
      else {
          // Single Item Logic
          const parent = derivedFolders[routineItem.parentFolder];
          const realItem = parent?.items?.find(i => (i.id || `${routineItem.parentFolder}-${i.index}`) === routineItem.id);
          
          if (!realItem) return { ...fallback, title: routineItem.title, nextItemName: "Item Missing" };

          const catUrl = (realItem.category || 'uncategorized').toLowerCase().replace(/\s+/g, '-');
          return {
             url: `/library/${catUrl}/${realItem.id || 0}`,
             image: parent?.image,
             title: routineItem.title,
             nextItemName: "Read Again",
             isReady: true,
             indexToRead: 0 // Doesn't matter for single item
          };
      }
  };

  return (
    <div className="min-h-screen bg-white text-black pb-20">
      
      {/* Header */}
      <div className="bg-white border-b px-6 py-6 sticky top-0 z-10">
         <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div>
               <h1 className="text-2xl font-bold">Nitya Niyam</h1>
               <p className="text-gray-500 text-sm">Your Daily Spiritual Routine</p>
            </div>
            <button 
               onClick={() => { setShowModal(true); setModalMode('folders'); }}
               className="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800 transition shadow-lg"
            >
               <Plus size={18}/> Add Routine
            </button>
         </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-4xl mx-auto px-6 py-8">
         
         {!loading && myRoutine.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
               <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3"/>
               <h3 className="text-lg font-bold text-gray-700">No Routine Found</h3>
               <p className="text-gray-500 text-sm">Add folders from the library to start.</p>
            </div>
         )}

         <div className="grid grid-cols-1 gap-4">
            {myRoutine.map((item, idx) => {
               const progress = getProgress(item.id);
               const isGoalMet = progress.dailyCount >= item.target && progress.lastDate === new Date().toDateString();
               const percent = Math.min(100, (progress.dailyCount / item.target) * 100);
               
               const linkData = getSafeLinkData(item);

               return (
                  <div key={idx} className={`bg-white border rounded-xl p-4 shadow-sm flex gap-4 items-center transition relative overflow-hidden ${isGoalMet ? 'border-green-200 bg-green-50' : 'border-gray-200 hover:shadow-md'}`}>
                     
                     {/* Image */}
                     <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
                        {linkData.image ? (
                           <img src={linkData.image} alt="icon" className="w-full h-full object-cover"/>
                        ) : (
                           <span className="font-bold text-gray-400 text-xl">{linkData.title.charAt(0)}</span>
                        )}
                     </div>

                     {/* Content Info */}
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                           <h3 className="font-bold text-lg truncate capitalize text-gray-900">{linkData.title}</h3>
                           <button onClick={() => removeFromRoutine(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                        
                        {/* Next Pad Info */}
                        <p className="text-xs text-gray-500 mb-2 truncate flex items-center gap-1">
                           {!linkData.isReady && <AlertCircle size={10} className="text-amber-500"/>}
                           Next: <span className="font-medium text-black">{linkData.nextItemName}</span>
                        </p>

                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mb-1">
                           <span>Goal: {item.target}</span>
                           <span className={isGoalMet ? "text-green-600 font-bold" : "text-black"}>
                              {isGoalMet ? "Done! 🎉" : `${progress.dailyCount} Read`}
                           </span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                           <div className={`h-full transition-all duration-500 ${isGoalMet ? 'bg-green-500' : 'bg-black'}`} style={{ width: `${percent}%` }}></div>
                        </div>
                     </div>

                     {/* Action Button */}
                     <Link 
                        href={linkData.url}
                        onClick={(e) => {
                           // Pass the index we are reading (linkData.indexToRead) so we can save it as 'lastIndex'
                           if (!linkData.isReady || !handleReadClick(item, linkData.url, linkData.indexToRead)) {
                              e.preventDefault();
                           }
                        }}
                        className={`flex flex-col items-center justify-center px-5 py-2 rounded-lg font-bold text-sm transition h-full border ${
                           !linkData.isReady 
                           ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-wait'
                           : isGoalMet 
                              ? 'bg-white text-green-600 border-green-200 hover:bg-green-50' 
                              : 'bg-black text-white border-black hover:bg-gray-800'
                        }`}
                     >
                        {isGoalMet ? <CheckCircle size={20}/> : <ArrowRight size={20}/>}
                        <span className="mt-1 text-[10px] uppercase tracking-wider">{isGoalMet ? 'Done' : 'Read'}</span>
                     </Link>
                  </div>
               );
            })}
         </div>
      </div>

      {/* --- ADD MODAL --- */}
      <AnimatePresence>
         {showModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
               <motion.div initial={{scale:0.95}} animate={{scale:1}} className="bg-white w-full max-w-lg h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden relative">
                  
                  <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                     <h2 className="font-bold text-lg">
                        {modalMode === 'folders' ? 'Library Folders' : `Select Item`}
                     </h2>
                     <button onClick={() => { setShowModal(false); setModalMode('folders'); }} className="p-2 hover:bg-gray-200 rounded-full"><X size={20}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4">
                     {loading && <p className="text-center mt-10 text-gray-500">Loading Library...</p>}

                     {/* FOLDERS LIST */}
                     {!loading && modalMode === 'folders' && (
                        <div className="space-y-3">
                           {Object.values(derivedFolders).map(folder => {
                              const isAdded = myRoutine.some(r => r.id === folder.id);
                              return (
                                 <div key={folder.id} className="border p-3 rounded-xl flex gap-3 items-center hover:border-black transition">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                                       {folder.image ? <img src={folder.image} className="w-full h-full object-cover"/> : <span className="font-bold text-gray-400">{folder.name_EN.charAt(0)}</span>}
                                    </div>
                                    <div className="flex-1">
                                       <h4 className="font-bold text-sm capitalize">{folder.name_EN}</h4>
                                       <p className="text-xs text-gray-500">{folder.items.length} Items</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                       <button onClick={() => openAddPopup(folder.id, folder.items.length, 'folder', folder.name_EN)} disabled={isAdded} className={`px-3 py-1 text-xs font-bold rounded ${isAdded ? 'bg-green-100 text-green-700' : 'bg-black text-white'}`}>{isAdded ? 'Added' : 'Add Folder'}</button>
                                       <button onClick={() => { setSelectedFolderSlug(folder.id); setModalMode('items'); }} className="px-3 py-1 text-xs font-bold rounded border border-gray-300 hover:bg-gray-50">Select One</button>
                                    </div>
                                 </div>
                              )
                           })}
                        </div>
                     )}

                     {/* ITEMS LIST */}
                     {!loading && modalMode === 'items' && selectedFolderSlug && (
                        <div>
                           <button onClick={() => setModalMode('folders')} className="mb-4 text-xs font-bold text-gray-500 flex items-center gap-1 hover:text-black">&larr; Back</button>
                           {derivedFolders[selectedFolderSlug].items.map((item, i) => {
                              const uniqueId = item.id || `${selectedFolderSlug}-${i}`;
                              const isAdded = myRoutine.some(r => r.id === uniqueId);
                              const title = item.title?.Hi || item.title?.en || `Pad ${i+1}`;
                              return (
                                 <div key={i} className="border-b py-3 flex justify-between items-center last:border-0">
                                    <span className="font-medium text-sm line-clamp-1 flex-1 pr-2">{title}</span>
                                    <button onClick={() => openAddPopup(uniqueId, 1, 'item', title, selectedFolderSlug)} disabled={isAdded} className={`px-3 py-1 text-xs font-bold rounded ${isAdded ? 'bg-green-100 text-green-700' : 'bg-black text-white'}`}>{isAdded ? 'Added' : 'Add'}</button>
                                 </div>
                              )
                           })}
                        </div>
                     )}
                  </div>

                  {/* SETTINGS POPUP */}
                  {targetPopup && (
                     <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center p-6 animate-in fade-in">
                        <h3 className="text-lg font-bold mb-2">Set Daily Target</h3>
                        <p className="text-gray-500 mb-6 text-sm text-center">Reading goal for <br/><span className="font-bold text-black capitalize">{targetPopup.title}</span></p>
                        <input type="number" value={targetInput} onChange={(e) => setTargetInput(e.target.value)} className="w-24 text-center border-2 border-black rounded-lg p-2 text-xl font-bold mb-2 bg-transparent" min="1" max={targetPopup.max}/>
                        <p className="text-xs text-gray-400 mb-6">Total available: {targetPopup.max}</p>
                        <div className="flex gap-3 w-full max-w-[200px]">
                           <button onClick={() => setTargetPopup(null)} className="flex-1 py-2 font-bold text-gray-500 bg-gray-100 rounded-lg">Cancel</button>
                           <button onClick={confirmAdd} className="flex-1 py-2 font-bold text-white bg-black rounded-lg">Save</button>
                        </div>
                     </div>
                  )}

               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}