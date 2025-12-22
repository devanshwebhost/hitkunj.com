"use client";
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
// import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { useLibraryData } from '@/hooks/useLibraryData';

export default function LibraryCategoryPage() {
  const params = useParams();
  const { category } = params;
  const { language } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Hook se data mangwaya
  const { data, loading, error } = useLibraryData(category);

  // ---------------------------------------------------------
  // 1. SKELETON SCREEN LOADING STATE
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-divine-gradient">
        {/* Navbar Placeholder */}
        {/* <Navbar /> */}

        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header Skeleton */}
          <div className="mb-10 mt-10 animate-pulse">
            <div className="w-20 h-6 bg-black/10 rounded mb-4"></div>
            <div className="h-12 w-3/4 md:w-1/3 bg-black/10 rounded-lg mb-4 mt-10"></div>
            <div className="h-4 w-full md:w-1/2 bg-black/5 rounded mb-2"></div>
            <div className="h-4 w-5/6 md:w-1/3 bg-black/5 rounded"></div>
          </div>

          {/* Search Bar Skeleton */}
          <div className="mb-10 max-w-xl animate-pulse">
            <div className="w-full h-14 bg-amber-200/50 rounded-full"></div>
          </div>

          {/* Grid Skeleton Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
            {Array.from({ length: 6 }).map((_, index) => (
              <div 
                key={index} 
                className="h-64 rounded-xl bg-black/5 border-t-4 border-black/10 animate-pulse relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gray-300/30"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <div className="h-6 w-3/4 bg-gray-400/40 rounded mb-2"></div>
                  <div className="h-4 w-1/4 bg-amber-400/40 rounded"></div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 2. Error or No Data State
  // ---------------------------------------------------------
  if (error || !data) {
    return (
      <div className="min-h-screen bg-divine-gradient flex items-center justify-center">
        <h1 className="text-2xl text-spiritual-dark">There is nothing to show you</h1>
        <Link href="/" className="ml-4 text-spiritual-sky underline">Go Back</Link>
      </div>
    );
  }

  // ---------------------------------------------------------
  // 3. Main Content
  // ---------------------------------------------------------
  const items = data.items || [];
  
  // ✅ FIX: Using Flat Keys (title_EN instead of title.EN)
  const filteredItems = items.filter(item => {
    const itemTitle = item[`title_${language}`] || item.title_EN || "";
    return itemTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-divine-gradient">
      {/* <Navbar /> */}

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Section */}
        <div className="mb-10 mt-10">
          <Link href="/" className="inline-flex items-center text-spiritual-dark mb-4 hover:text-spiritual-amber transition">
            <ArrowLeft className="w-5 h-5 mr-2" />
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-spiritual-dark mt-10 mb-2 capitalize">
              {/* Fallback to Category Name from URL if metadata is missing */}
              {category.replace(/-/g, ' ')}
            </h1>
            <p className="text-gray-600 text-lg mb-2">
               Collection of {category.replace(/-/g, ' ')}
            </p>
          </motion.div>
        </div>

        {/* Search Bar */}
        <div className="mb-10 relative max-w-xl">
          <input
            type="text"
            placeholder={`Search...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-black p-4 pl-12 rounded-full border-2 border-amber-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400 outline-none shadow-sm transition bg-amber-400 placeholder-gray-700"
          />
        </div>

        {/* Grid Content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {filteredItems.map((item, index) => {
             // ✅ FIX: Determine title safely
             const displayTitle = item[`title_${language}`] || item.title_EN || "Untitled";
             
             return (
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
                  style={{ backgroundImage: `url(${item.image || '/logo-png.png'})` }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:from-black/80 transition-all duration-500" />

                {/* Content */}
                <div className="relative z-10 h-full p-6 flex flex-col justify-end">
                  <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    {displayTitle}
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
          )})}
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