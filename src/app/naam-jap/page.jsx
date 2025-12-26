"use client";
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { useLibraryData } from '@/hooks/useLibraryData';
import { Image as ImageIcon, Settings, X, Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function NaamJap() {
  const { userData, setUserData, incrementJap } = useUser();
  const { data: libraryData } = useLibraryData();
  const { language, cycleLanguage, t } = useLanguage();
  const [images, setImages] = useState([]);
  const [activeImage, setActiveImage] = useState(null); // Changed from bgImage
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [showGoalSettings, setShowGoalSettings] = useState(false);
  
  // Goal Calculation
  const daysLeft = userData.naamJap.longTermDays; 
  const remainingCount = userData.naamJap.longTermGoal - userData.naamJap.count;
  const dailyNeed = daysLeft > 0 ? Math.ceil(remainingCount / daysLeft) : 0;
  const todayCount = userData.naamJap.history[new Date().toDateString()] || 0;

  useEffect(() => {
    // Extract images from library
    if (libraryData) {
       const imgs = [];
       Object.values(libraryData).forEach(cat => {
          cat.items.forEach(item => {
             if (item.image) imgs.push(item.image);
          });
       });
       setImages(imgs);
       if (imgs.length > 0 && !activeImage) setActiveImage(imgs[0]);
    }
  }, [libraryData]);

  const handleGoalUpdate = (e) => {
    e.preventDefault();
    const target = Number(e.target.goal.value);
    const days = Number(e.target.days.value);
    setUserData(prev => ({
       ...prev, 
       naamJap: { ...prev.naamJap, longTermGoal: target, longTermDays: days, startDate: Date.now() }
    }));
    setShowGoalSettings(false);
    alert("Sankalp (Goal) Updated!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white flex flex-col items-center relative overflow-hidden ">
      
      {/* Top Header */}
      <div className="w-full max-w-lg px-4 py-4 flex justify-between items-center z-10">
         <div>
            <h1 className="text-xl font-bold text-amber-500">{t('naam_jap')}</h1>
            <p className="text-xs text-gray-400">{t('naam_jap_para')}</p>
         </div>
         <div className="flex gap-2">
            <button 
              onClick={() => setShowGoalSettings(true)} 
              className="bg-gray-800 p-2 rounded-full border border-gray-700 hover:text-amber-400 transition"
            >
               <Settings size={20} />
            </button>
            <button 
              onClick={() => setShowImageSelector(!showImageSelector)} 
              className={`p-2 rounded-full border transition ${showImageSelector ? 'bg-amber-600 border-amber-500' : 'bg-gray-800 border-gray-700 hover:text-amber-400'}`}
            >
               <ImageIcon size={20} />
            </button>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-lg flex flex-col px-4 pb-6 z-10">
         
         {/* 1. Image Selector Drawer (Collapsible) */}
         {showImageSelector && (
            <div className="bg-gray-800/90 backdrop-blur-md p-3 rounded-xl mb-4 border border-gray-700 overflow-x-auto whitespace-nowrap animate-in slide-in-from-top-2">
               {images.length > 0 ? images.map((img, i) => (
                  <img 
                    key={i} 
                    src={img} 
                    onClick={() => { setActiveImage(img); setShowImageSelector(false); }}
                    className={`w-16 h-16 object-cover inline-block mr-2 rounded-lg cursor-pointer border-2 transition-all ${activeImage === img ? 'border-amber-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`} 
                  />
               )) : <p className="text-sm text-gray-400">Loading images from library...</p>}
            </div>
         )}

         {/* 2. THE MAIN IMAGE (Darshan Area) */}
         <div className="flex-1 flex items-center justify-center min-h-[300px] mb-4 relative">
             {activeImage ? (
                <div className="relative max-h-min w-full h-full max-h-[50vh] flex items-center justify-center p-2 rounded-2xl bg-black/40 border border-white/10 shadow-2xl">
                    {/* Image with object-contain to show FULL photo */}
                    <img 
                      src={activeImage} 
                      alt="Darshan" 
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                </div>
             ) : (
                <div className="text-gray-500 flex flex-col items-center">
                   <ImageIcon size={48} className="mb-2 opacity-50"/>
                   <p>Select an image for Darshan</p>
                </div>
             )}
         </div>

         {/* 3. Counter & Action Area */}
         <div className="bg-gray-800/80 backdrop-blur-lg rounded-3xl p-6 border border-gray-700 shadow-xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500/20 blur-[50px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
               {/* Stats Row */}
               <div className="flex justify-between items-end mb-6 text-gray-300">
                  <div>
                     <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Today</span>
                     <div className="text-2xl font-bold text-white">{todayCount}</div>
                  </div>
                  <div className="text-right">
                     <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Jap</span>
                     <div className="text-4xl font-mono font-bold text-amber-400 drop-shadow-sm">
                        {userData.naamJap.count.toLocaleString()}
                     </div>
                  </div>
               </div>

               {/* BIG TAP BUTTON */}
               <button 
                 onClick={incrementJap}
                 className="w-full py-5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 text-white text-2xl font-bold shadow-lg shadow-orange-900/40 active:scale-[0.98] transition-all border-t border-white/20 flex items-center justify-center gap-2 group"
               >
                 <span className="group-active:scale-110 transition-transform">radha</span>
                 <span className="text-lg opacity-80 font-normal">(Tap)</span>
               </button>

               {/* Mini Goal Status */}
               <div className="mt-4 flex justify-between text-xs text-gray-400 px-1">
                  <span>Goal Left: <span className="text-gray-300">{remainingCount > 0 ? remainingCount.toLocaleString() : 0}</span></span>
                  <span>Daily Target: <span className="text-gray-300">{dailyNeed}</span></span>
               </div>
            </div>
         </div>
      </div>

      {/* Goal Settings Modal (Overlay) */}
      {showGoalSettings && (
         <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-2xl w-full max-w-sm shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2"><Check className="text-green-500"/> Set Sankalp</h3>
                  <button onClick={() => setShowGoalSettings(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
               </div>
               
               <form onSubmit={handleGoalUpdate} className="space-y-4">
                  <div>
                     <label className="block text-sm text-gray-400 mb-1">Total Naam Jap Goal</label>
                     <input name="goal" type="number" defaultValue={userData.naamJap.longTermGoal} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                     <label className="block text-sm text-gray-400 mb-1">Target Days</label>
                     <input name="days" type="number" defaultValue={userData.naamJap.longTermDays} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <button type="submit" className="w-full bg-amber-600 text-white py-3 rounded-lg font-bold hover:bg-amber-500 transition">
                     Update Goal
                  </button>
               </form>
            </div>
         </div>
      )}

    </div>
  );
}