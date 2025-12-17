"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLibraryData } from '@/hooks/useLibraryData';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Folder, ChevronRight } from 'lucide-react';

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
  const { language } = useLanguage(); // ✅ LANGUAGE CONTEXT
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

  // --- SEARCH LOGIC (HI + EN) ---
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
      <div className="min-h-screen bg-divine-gradient flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-spiritual-amber"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* 🔤 HEADING LANGUAGE */}
        <div className="text-center mb-10 mt-6">
          <h1 className="text-4xl font-bold text-black mb-3">
            {language === "HI" ? "पुस्तकालय फोल्डर" : "Library Folders"}
          </h1>
          <p className="text-gray-600">
            {language === "HI"
              ? "विषयों के अनुसार संग्रह ब्राउज़ करें"
              : "Browse your collection organized by topics"}
          </p>
        </div>

        {/* 🔍 SEARCH */}
        <div className="max-w-2xl mx-auto mb-12 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-700" />
          </div>
          <input
            type="text"
            placeholder={language === "HI" ? "फोल्डर खोजें..." : "Search folder..."}
            className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-spiritual-amber outline-none text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 📁 FOLDERS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFolders.map((folder) => (
            <Link key={folder.slug} href={`/lab/${folder.slug}`} className="group block">
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border transition-all">

                {/* IMAGE */}
                <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                  {folder.images.length > 0 ? (
                    <img
                      src={folder.images[0]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-amber-50 text-spiritual-amber/30">
                      <Folder size={64} />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    {/* 🔤 FOLDER NAME LANGUAGE */}
                    <h3 className="font-bold text-xl text-gray-800 group-hover:text-spiritual-amber">
                      {language === "HI" ? folder.name_HI : folder.name_EN}
                    </h3>
                    <div className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded-md">
                      {folder.items.length}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center text-sm text-blue-500 font-medium opacity-0 group-hover:opacity-100">
                    {language === "HI" ? "खोलें" : "Open"}
                    <ChevronRight size={16} className="ml-1" />
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
