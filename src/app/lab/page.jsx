"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLibraryData } from '@/hooks/useLibraryData';
import { useLanguage } from '@/context/LanguageContext';
import { Search, Folder, ChevronRight } from 'lucide-react';

// --- Helper 1: Slugify (URL ke liye) ---
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// --- Helper 2: Formatter (Display ke liye) ---
// Ye 'shri-hit-kunj' ko 'Shri Hit Kunj' bana dega
const formatFolderName = (text) => {
  if (!text) return "";
  return text
    .toString()
    .replace(/-/g, ' ') // Hyphen ko space banao
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Har word ka pehla letter capital
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
            
            // 1. Raw name clean karo
            const rawName = item.folder.trim();
            
            // 2. Display Name Format karo (Shri Hit Kunj)
            // Isse 'shri-hit-kunj' aur 'Shri Hit Kunj' ek hi maane jayenge
            const displayName = formatFolderName(rawName);

            if (!folderMap[displayName]) {
              folderMap[displayName] = {
                name: displayName,       // Display Name (Shri Hit Kunj)
                slug: slugify(rawName),  // URL Slug (shri-hit-kunj)
                items: [],
                images: []
              };
            }

            folderMap[displayName].items.push(item);
            
            if (item.image && folderMap[displayName].images.length < 3) {
                folderMap[displayName].images.push(item.image);
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
    if (folder.name.toLowerCase().includes(query)) return true;
    
    return folder.items.some(item => 
      item.title?.[language]?.toLowerCase().includes(query) ||
      item.title?.EN?.toLowerCase().includes(query)
    );
  });

  if (loading) {
     return (
        <div className="min-h-screen bg-divine-gradient">
            <div className="flex justify-center items-center h-[80vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-spiritual-amber"></div>
            </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        <div className="text-center mb-10 mt-6">
            <h1 className="text-4xl font-bold text-black mb-3">Library Folders</h1>
            <p className="text-gray-600">Browse your collection organized by topics</p>
        </div>

        <div className="max-w-2xl mx-auto mb-12 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-700" />
            </div>
            <input 
                type="text"
                placeholder="Search folder or find a pad inside..."
                className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm bg-white text-black placeholder-gray-500 focus:ring-2 focus:ring-spiritual-amber focus:border-transparent outline-none transition-all text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFolders.map((folder) => (
                <Link key={folder.name} href={`/lab/${folder.slug}`} className="group block">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 transform hover:-translate-y-1">
                        
                        {/* Collage Logic Same as Before */}
                        <div className="h-48 w-full bg-gray-100 relative overflow-hidden">
                            {folder.images.length === 0 ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-amber-50 text-spiritual-amber/30"><Folder size={64} /></div>
                            ) : folder.images.length === 1 ? (
                                <img src={folder.images[0]} alt={folder.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : folder.images.length === 2 ? (
                                <div className="flex h-full w-full">
                                    <div className="w-1/2 h-full border-r border-white/20"><img src={folder.images[0]} className="w-full h-full object-cover" /></div>
                                    <div className="w-1/2 h-full"><img src={folder.images[1]} className="w-full h-full object-cover" /></div>
                                </div>
                            ) : (
                                <div className="flex h-full w-full">
                                    <div className="w-2/3 h-full border-r border-white/20"><img src={folder.images[0]} className="w-full h-full object-cover" /></div>
                                    <div className="w-1/3 h-full flex flex-col">
                                        <div className="h-1/2 border-b border-white/20"><img src={folder.images[1]} className="w-full h-full object-cover" /></div>
                                        <div className="h-1/2"><img src={folder.images[2]} className="w-full h-full object-cover" /></div>
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all" />
                        </div>

                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                {/* Yahan ab formatted name dikhega (Shri Hit Kunj) */}
                                <h3 className="font-bold text-xl text-gray-800 leading-tight group-hover:text-spiritual-amber transition-colors">
                                    {folder.name} 
                                </h3>
                                <div className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-1 rounded-md flex-shrink-0">
                                    {folder.items.length} Items
                                </div>
                            </div>
                            
                            {searchTerm && (
                                <p className="text-xs text-green-600 mt-2 flex items-center"><Search size={12} className="mr-1" /> Match found</p>
                            )}

                            <div className="mt-4 flex items-center text-sm text-blue-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                Open Folder <ChevronRight size={16} className="ml-1" />
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
        
        {!loading && filteredFolders.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                <Folder size={48} className="mx-auto mb-4 opacity-30" />
                <p>No folders found matching "{searchTerm}"</p>
            </div>
        )}
      </div>
    </div>
  );
}