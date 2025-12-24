"use client";
import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react'; 
import { useLibraryData } from '@/hooks/useLibraryData';
import { useLanguage } from '@/context/LanguageContext';
import { useAnalytics, useAnalyticsData } from '@/hooks/useAnalytics'; 

const slugify = (text) => text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-') || "";

const formatFolderName = (text) => text ? text.toString().replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : "";

export default function FolderDetailPage() {
  const params = useParams();
  const { slug } = params;
  
  const { language } = useLanguage();
  const { data, loading } = useLibraryData();
  const { rankings } = useAnalyticsData();
  
  const [searchTerm, setSearchTerm] = useState('');

  const folderData = useMemo(() => {
    if (!data) return null;

    let foundItems = [];
    let nameEN = "";
    let nameHI = "";

    Object.entries(data).forEach(([catKey, category]) => {
      if (category?.items && Array.isArray(category.items)) {
        category.items.forEach((item) => {
          const folderName = item.folder || "";
          
          if (folderName) {
            const currentSlug = slugify(folderName);
            if (currentSlug === slug) {
              foundItems.push({ ...item, category: item.category || catKey });
              if (!nameEN) nameEN = formatFolderName(folderName);
              if (!nameHI && item.folder_HI) nameHI = item.folder_HI; 
            }
          }
        });
      }
    });

    return { 
        name_EN: nameEN, 
        name_HI: nameHI || nameEN, 
        items: foundItems 
    };
  }, [data, slug]);

  // ✅ SORT BY SEQUENCE (First Priority)
  const sortedItems = useMemo(() => {
      if(!folderData?.items) return [];
      
      return [...folderData.items].sort((a, b) => {
          // 1. Sequence Check (Manual Order)
          // Default sequence 999999 maan lete hain taaki jinka set nahi hai wo last me aayein
          const seqA = a.sequence || 999999;
          const seqB = b.sequence || 999999;
          
          if (seqA !== seqB) {
             return seqA - seqB; // Ascending Order (1, 2, 3...)
          }

          // 2. Agar sequence same hai, to Views ke hisaab se sort karo
          const rankA = rankings.find(r => r.id === String(a.id))?.views || 0;
          const rankB = rankings.find(r => r.id === String(b.id))?.views || 0;
          return rankB - rankA;
      });
  }, [folderData, rankings]);

  const filteredItems = sortedItems.filter(item => {
    const titleLocal = item[`title_${language}`] || "";
    const titleEN = item.title_EN || "";
    return titleLocal.toLowerCase().includes(searchTerm.toLowerCase()) ||
           titleEN.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const folderTitle = language === 'HI' ? folderData?.name_HI : folderData?.name_EN;
  
  useAnalytics(folderData ? slug : null, folderTitle, 'folder');

  if (loading) return <div className="min-h-screen bg-divine-gradient flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-spiritual-amber"></div></div>;

  if (!folderData || !folderData.name_EN) return <div className="p-10 text-center text-xl">Folder Not Found</div>;

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
            className="w-full pl-12 pr-4 py-3 rounded-full border border-amber-400 focus:border-amber-400 focus:ring-2 bg-amber-400 focus:ring-amber-400 text-black placeholder-gray-500 focus:ring-2 focus:ring-spiritual-amber outline-none shadow-sm transition"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {filteredItems.map((item) => {
             const displayTitle = item[`title_${language}`] || item.title_EN || "Untitled";

             return (
                 <div key={item.id} className="group relative h-64 overflow-hidden rounded-xl shadow-md border-t-4 border-spiritual-sky bg-white">
                     <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" 
                        style={{ backgroundImage: `url(${item.image || '/logo-png.png'})` }} 
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/80 transition-all duration-500" />
                     <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          {displayTitle}
                        </h2>
                        
                        <Link href={`/library/${item.category || 'pad-gayan'}/${item.id}`} className="absolute inset-0 z-20" />
                     </div>
                 </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}