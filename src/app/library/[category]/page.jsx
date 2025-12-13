"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, BookOpen, Music, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar'; // Import Navbar
import { useLanguage } from '@/context/LanguageContext';
// import { libraryData } from '@/data/libraryData';
import { useLibraryData } from '@/hooks/useLibraryData'; // Import Hook

export default function LibraryCategoryPage() {
  const params = useParams();
  const { category } = params; // URL se category milegi (eg: 'rasik-sant')
  const { language, t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Data fetch karna based on category
 // Hook se data mangwaya
  const { data, loading, error } = useLibraryData(category);

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-divine-gradient flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-spiritual-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-spiritual-dark font-medium">Loading...</p>
      </div>
    );
  }

  // 2. Error or No Data State
  if (error || !data) {
    return (
      <div className="min-h-screen bg-divine-gradient flex items-center justify-center">
        <h1 className="text-2xl text-spiritual-dark">There is nothing to show you</h1>
        <Link href="/" className="ml-4 text-spiritual-sky underline">Go Back</Link>
      </div>
    );
  }

  // Baaki code same rahega, bas 'data' variable ab API se aa raha hai
  const filteredItems = data.items.filter(item => 
    item.title[language]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-divine-gradient">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* 1. Header Section with Back Button */}
        <div className="mb-10 mt-10">
          <Link href="/" className="inline-flex items-center text-spiritual-dark  mb-4 hover:text-spiritual-amber transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
            
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-spiritual-dark mt-10 mb-2">
              {data.title[language]}
            </h1>
            <p className="text-gray-600 text-lg mb-2">
              {data.description[language]}
            </p>
          </motion.div>
        </div>

        {/* 2. Search Bar for this Category */}
        <div className="mb-10 relative max-w-xl">
          <input
            type="text"
            placeholder={`Search in your Current language...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-black p-4 pl-12 rounded-full border-2 border-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 outline-none shadow-sm transition bg-amber-400"
          />
          {/* <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" /> */}
        </div>

        {/* 3. Grid Content */}
        {/* 3. Grid Content — Premium Full Image Cards */}
<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">

  {filteredItems.map((item, index) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="group relative h-64 overflow-hidden rounded-xl shadow-md border-t-4 border-spiritual-sky hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${item.image})` }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/80 transition-all duration-500" />

      {/* Content */}
      <div className="relative z-10 h-full p-6 flex flex-col justify-end">
        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          {item.title[language]}
        </h2>

        <p className="text-spiritual-gold font-medium text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
          {item.type === "audio" ? "Suno →" : "Padhien →"}
        </p>

        {/* Clickable Link */}
        <Link 
          href={`/library/${category}/${item.id}`} 
          className="absolute inset-0 z-20"
        />
      </div>
    </motion.div>
  ))}

</div>


        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-20 opacity-60">
            <p className="text-xl text-spiritual-dark">Koi parinam nahi mila (No results found).</p>
          </div>
        )}

      </div>
    </div>
  );
}