"use client";
import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';
import { useLibraryData } from '@/hooks/useLibraryData';
import { useLanguage } from '@/context/LanguageContext';

const slugify = (text) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
const formatFolderName = (text) => text ? text.toString().replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : "";

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  
  const { language } = useLanguage();
  const { data, loading } = useLibraryData();
  const [searchTerm, setSearchTerm] = useState('');

  const folderData = useMemo(() => {
    if (!data) return null;

    let foundItems = [];
    let nameEN = "";
    let nameHI = "";

    Object.values(data).forEach((category) => {
      if (category?.items && Array.isArray(category.items)) {
        category.items.forEach((item) => {
          if (item.folder) {
            const currentSlug = slugify(item.folder);
            if (currentSlug === slug) {
              foundItems.push(item);
              if (!nameEN) nameEN = formatFolderName(item.folder);
              // Agar Hindi naam sheet me hai, to wo uthao
              if (!nameHI && item.folder_HI) nameHI = item.folder_HI; 
            }
          }
        });
      }
    });

    return { 
        name_EN: nameEN, 
        name_HI: nameHI || nameEN, // Fallback
        items: foundItems 
    };
  }, [data, slug]);

  const filteredItems = folderData?.items.filter(item => 
    item.title?.[language]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title?.EN?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (loading) return <div className="min-h-screen bg-divine-gradient flex justify-center items-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-spiritual-amber"></div></div>;

  if (!folderData || !folderData.name_EN) return <div>Not Found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="mb-8 mt-4">
          <Link href="/lab" className="inline-flex items-center text-gray-600 hover:text-spiritual-amber transition mb-6">
            <ArrowLeft className="w-5 h-5 mr-2" /> {language === 'HI' ? "वापस जाएं" : "Back to Folders"}
          </Link>
          
          {/* ✅ DYNAMIC TITLE */}
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
            {language === 'HI' ? folderData.name_HI : folderData.name_EN}
          </h1>
          <p className="text-gray-500">{folderData.items.length} items</p>
        </div>

        {/* ... Search Bar aur Grid Code Same Rahega ... */}
        {/* Bas Input placeholder bhi language ke hisab se badal dena */}
        <input
            type="text"
            placeholder={language === 'HI' ? "खोजें..." : "Search..."}
            // ...
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-spiritual-amber outline-none shadow-sm transition"
        />
        
        {/* ... Grid Items Rendering ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {filteredItems.map((item) => (
             <div key={item.id} className="group relative h-64 overflow-hidden rounded-xl shadow-md border-t-4 border-spiritual-sky bg-white">
                 <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style={{ backgroundImage: `url(${item.image})` }} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/80 transition-all duration-500" />
                 <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                    <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      {item.title[language]}
                    </h2>
                    <Link href={`/library/${item.category || 'pad-gayan'}/${item.id}`} className="absolute inset-0 z-20" />
                 </div>
             </div>
          ))}
        </div>

      </div>
    </div>
  );
}