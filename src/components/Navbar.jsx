"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Search, Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext'; // 1. Context import kiya

export default function Navbar() {
  // 2. Context se global variables uthaye (Local state hata diya)
  const { language, cycleLanguage, t } = useLanguage(); 
  
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value;
    console.log("Searching for:", query);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        // Aapka 'bg-black' maintain kiya hai
        className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-spiritual-gold/30 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* 1. Logo Section */}
            <div className="flex-shrink-0 flex items-center cursor-pointer">
              <Link href="/">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-spiritual-light to-spiritual-amber tracking-wide">
                  Hit Harivansh Sewa
                </h1>
              </Link>
            </div>

            {/* 2. Desktop Menu Links */}
            <div className="hidden md:flex space-x-8 items-center">
              {/* Text Colors ko 'text-gray-100' kiya hai taaki Black background par dikhe */}
              <Link href="/" className="text-gray-100 hover:text-spiritual-amber font-medium transition hover:scale-105">
                {t('nav_home')}
              </Link>
              <Link href="/library/rasik-sant" className="text-gray-100 hover:text-spiritual-amber font-medium transition hover:scale-105">
                {t('nav_saints')}
              </Link>
              <Link href="/library/pad-gayan" className="text-gray-100 hover:text-spiritual-amber font-medium transition hover:scale-105">
                {t('nav_music')}
              </Link>

              {/* Functional Buttons Group */}
              <div className="flex items-center space-x-3 border-l border-spiritual-gold/30 pl-4">
                
                {/* Search Toggle Button */}
                <button 
                  onClick={() => setShowSearch(!showSearch)} 
                  className={`p-2 rounded-full transition ${showSearch ? 'bg-spiritual-light text-white' : 'text-gray-200 hover:bg-gray-800'}`}
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Language Switcher (Context Logic Connected) */}
                <button 
                  onClick={cycleLanguage} // Global function call
                  className="flex items-center space-x-1 px-3 py-1 border border-spiritual-gold rounded-full text-xs font-bold text-spiritual-gold hover:bg-spiritual-gold hover:bg-amber-400 transition"
                >
                  <Globe className="w-3 h-3" />
                  <span>{language}</span>
                </button>
              </div>
            </div>

            {/* 3. Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
               <button onClick={() => setShowSearch(!showSearch)}>
                  <Search className="w-5 h-5 text-gray-100" />
               </button>

              <button onClick={() => setIsOpen(!isOpen)} className="text-gray-100 p-2">
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 4. Search Bar Dropdown */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-900 border-b border-spiritual-sky/30 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto p-4 flex gap-2">
                <input 
                  name="search"
                  type="text" 
                  placeholder={t('search_placeholder')}
                  className="w-full px-4 py-2 rounded-lg border border-spiritual-sky/50 bg-black text-white focus:outline-none focus:ring-2 focus:ring-spiritual-gold"
                  autoFocus
                />
                <button type="submit" className="bg-spiritual-dark text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-100 hover:text-black transition">
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. Mobile Menu Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900 border-t border-gray-800 shadow-xl"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                <Link 
                  href="/" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-100 hover:bg-gray-800"
                >
                  {t('nav_home')}
                </Link>
                <Link 
                  href="/library/rasik-sant" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-100 hover:bg-gray-800"
                >
                  {t('nav_saints')}
                </Link>
                <Link 
                  href="/library/pad-gayan" 
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-100 hover:bg-gray-800"
                >
                  {t('nav_music')}
                </Link>
                
                {/* Mobile Language Button */}
                <button 
                  onClick={cycleLanguage}
                  className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-spiritual-amber hover:bg-gray-800 flex items-center gap-2"
                >
                  <Globe className="w-4 h-4" />
                  Language: {language}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}