"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react'; 
import { useLanguage } from '@/context/LanguageContext';
import { useAnalytics } from '@/hooks/useAnalytics'; 

export default function FolderClient({ folderData, slug }) {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Sorting Logic (Passed data is already filtered by folder)
  const sortedItems = useMemo(() => {
      if(!folderData?.items) return [];
      
      return [...folderData.items].sort((a, b) => {
          const seqA = a.sequence || 999999;
          const seqB = b.sequence || 999999;
          return seqA - seqB; 
      });
  }, [folderData]);

  const filteredItems = sortedItems.filter(item => {
    const titleLocal = item[`title_${language}`] || "";
    const titleEN = item.title_EN || "";
    return titleLocal.toLowerCase().includes(searchTerm.toLowerCase()) ||
           titleEN.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const folderTitle = language === 'HI' ? folderData?.name_HI : folderData?.name_EN;
  
  // Analytics Hook
  useAnalytics(slug, folderTitle, 'folder');

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="mb-8 mt-4">
          <Link href="/lab" className="inline-flex items-center text-gray-600 hover:text-spiritual-amber transition mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" /> {language === 'HI' ? "वापस जाएं" : "Back to Folders"}
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 capitalize">
            {folderTitle}
          </h1>
          <p className="text-gray-500">{folderData.items.length} items</p>
        </div>

        <input
            type="text"
            placeholder={language === 'HI' ? "खोजें..." : "Search..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-amber-400 focus:border-amber-400 focus:ring-2 bg-amber-400 text-black placeholder-gray-800 outline-none shadow-sm transition"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {filteredItems.map((item) => {
             const displayTitle = item[`title_${language}`] || item.title_EN || "Untitled";

             return (
                 <div key={item.id} className="group relative h-64 overflow-hidden rounded-xl shadow-md border-t-4 border-spiritual-sky bg-gray-900">
                     {/* ✅ SEO FIX: Using real Image tag instead of background image */}
                     <img
                        src={item.image || '/logo-png.png'} 
                        alt={displayTitle}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
                     />
                     
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/80 transition-all duration-500" />
                     
                     <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          {displayTitle}
                        </h2>
                        
                        <Link href={`/library/${item.category || 'pad-gayan'}/${item.id}`} className="absolute inset-0 z-20" aria-label={`Read ${displayTitle}`} />
                     </div>
                 </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}