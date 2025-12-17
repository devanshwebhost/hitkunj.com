"use client";
// 1. Suspense import karna zaroori hai
import { Suspense } from 'react'; 
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, BookOpen, Music, ArrowLeft } from 'lucide-react';
// import Navbar from '@/components/Navbar';
import { useLanguage } from '@/context/LanguageContext';
import { useLibraryData } from '@/hooks/useLibraryData';

// 2. Yeh wahi purana component hai, bas naam badal kar 'SearchContent' kar diya
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const { language } = useLanguage();
  const { data: allData, loading } = useLibraryData();

  let results = [];
  
  if (allData && query) {
    const searchTerms = query.toLowerCase().trim().split(/\s+/).filter(word => word.length > 0);

    Object.keys(allData).forEach((categoryKey) => {
      const categoryItems = allData[categoryKey].items || [];
      
      const matches = categoryItems.filter((item) => {
        const combinedText = [
          ...Object.values(item.title || {}),
          ...Object.values(item.desc || {}),
          ...Object.values(item.fullContent || {})
        ].join(' ').toLowerCase(); 

        return searchTerms.every((term) => combinedText.includes(term));
      });

      const matchesWithCategory = matches.map(item => ({ ...item, categoryKey }));
      results = [...results, ...matchesWithCategory];
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}

      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8 mt-4">
          <Link href="/" className="inline-flex items-center text-gray-600 mb-4 hover:text-yellow-600 transition">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">
             परिणाम (Results for): <span className="text-yellow-600">"{query}"</span>
          </h1>
          <p className="text-gray-500 mt-2">
            कुल {results.length} परिणाम मिले
          </p>
        </div>

        {/* Loading */}
        {loading && (
           <div className="flex justify-center py-20">
             <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">कुछ नहीं मिला (No matches found)</h2>
            <p className="text-gray-400 mt-2">
               Try searching simpler words separately.
            </p>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="relative h-48">
                <img 
                  src={item.image} 
                  alt={item.title[language]} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-sm">
                   {item.type === 'audio' ? <Music size={18} className="text-pink-600"/> : <BookOpen size={18} className="text-blue-600"/>}
                </div>
                
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-4">
                   <span className={`text-xs font-bold text-white px-2 py-1 rounded-full uppercase ${item.categoryKey === 'pad-gayan' ? 'bg-pink-500' : 'bg-blue-500'}`}>
                      {item.categoryKey === 'pad-gayan' ? 'Pad / Bhajan' : 'Sant Charitra'}
                   </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                  {item.title[language]}
                </h3>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {item.desc[language]}
                </p>
                
                <div className="mb-4 bg-yellow-50 border border-yellow-100 p-2 rounded text-xs text-gray-600 italic">
                    Found inside content/title...
                </div>

                <Link href={`/library/${item.categoryKey}/${item.id}`}>
                  <button className="w-full py-2 rounded-lg border border-yellow-500 text-yellow-700 font-semibold hover:bg-yellow-500 hover:text-white transition">
                    View Details
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

// 3. Main Page Component (Isme hamne Suspense lagaya hai)
export default function SearchPage() {
  return (
    // Fallback wo dikhata hai jab tak URL params load ho rahe hon
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}