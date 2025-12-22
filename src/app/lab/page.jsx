"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLibraryData } from '@/hooks/useLibraryData';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Folder, ChevronRight, Layers } from 'lucide-react';

// --- Helper 1: Slugify ---
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

// --- Helper 2: Formatter ---
const formatFolderName = (text) => {
  if (!text) return "";
  return text
    .toString()
    .replace(/-/g, ' ')
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export default function LabPage() {
  const { data, loading } = useLibraryData();
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // --- DATA PROCESSING ---
  const folders = useMemo(() => {
    if (!data) return [];

    const folderMap = {};

    Object.values(data).forEach((category) => {
      if (category?.items && Array.isArray(category.items)) {
        category.items.forEach((item) => {
          if (item.folder) {
            const rawEN = item.folder.trim();
            const rawHI = item.folder_HI?.trim() || rawEN;
            const slug = slugify(rawEN);

            if (!folderMap[slug]) {
              folderMap[slug] = {
                slug,
                name_EN: formatFolderName(rawEN),
                name_HI: rawHI,
                items: [],
                images: []
              };
            }

            folderMap[slug].items.push(item);
            if (item.image && folderMap[slug].images.length < 3) {
              folderMap[slug].images.push(item.image);
            }
          }
        });
      }
    });

    return Object.values(folderMap);
  }, [data]);

  // --- SEARCH LOGIC ---
  const filteredFolders = folders.filter(folder => {
    const query = searchTerm.toLowerCase();
    if (folder.name_EN.toLowerCase().includes(query)) return true;
    if (folder.name_HI.toLowerCase().includes(query)) return true;
    return folder.items.some(item =>
      item.title?.[language]?.toLowerCase().includes(query) ||
      item.title?.EN?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* 🔤 HEADING */}
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl font-bold mb-3">
            {language === "HI" ? "पुस्तकालय फोल्डर" : "Library Folders"}
          </h1>
          <p className="text-gray-400">
            {language === "HI"
              ? "विषयों के अनुसार संग्रह ब्राउज़ करें"
              : "Browse your collection organized by topics"}
          </p>
        </div>

        {/* 🔍 SEARCH */}
        <div className="max-w-2xl mx-auto mb-12 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={language === "HI" ? "फोल्डर खोजें..." : "Search folders..."}
            className="w-full pl-12 pr-4 py-3.5 rounded-full border border-gray-800 bg-gray-900/50 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 📁 FOLDERS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFolders.map((folder) => (
            <Link key={folder.slug} href={`/lab/${folder.slug}`} className="group relative block w-full">
              
              {/* CARD CONTAINER - ASPECT RATIO FIXED */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                
                {/* BACKGROUND IMAGE */}
                {folder.images.length > 0 ? (
                  <img
                    src={folder.images[0]}
                    alt={folder.name_EN}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90"
                  />
                ) : (
                  // Fallback Gradient if no image
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                    <Folder size={64} className="text-gray-700 opacity-50" />
                  </div>
                )}

                {/* GRADIENT OVERLAY (For Text Readability) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />

                {/* 🔹 TOP ROW: ICON (Left) & COUNT (Right) */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10">
                    {/* Top Left Icon */}
                    <div className="bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10 text-amber-400 shadow-sm">
                        <Folder size={20} fill="currentColor" className="opacity-80" />
                    </div>

                    {/* Top Right Count */}
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white shadow-sm">
                        <Layers size={14} className="text-gray-400"/>
                        <span>{folder.items.length} {language === "HI" ? "लेख" : "Items"}</span>
                    </div>
                </div>

                {/* 🔹 BOTTOM ROW: TITLE */}
                <div className="absolute bottom-0 left-0 w-full p-5 z-10">
                  <h3 className="text-2xl font-bold text-white tracking-wide drop-shadow-md group-hover:text-amber-400 transition-colors">
                    {language === "HI" ? folder.name_HI : folder.name_EN}
                  </h3>
                  
                  {/* Optional: 'View' text that appears on hover */}
                  <div className="h-0 overflow-hidden group-hover:h-6 transition-all duration-300 ease-out">
                     <p className="text-sm text-gray-300 mt-1 flex items-center gap-1">
                        {language === "HI" ? "फोल्डर खोलें" : "Open Folder"} <ChevronRight size={14} />
                     </p>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

        {!loading && filteredFolders.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Folder size={48} className="mx-auto mb-4 opacity-30" />
            <p>
              {language === "HI"
                ? "कोई फोल्डर नहीं मिला"
                : `No folders found for "${searchTerm}"`}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}