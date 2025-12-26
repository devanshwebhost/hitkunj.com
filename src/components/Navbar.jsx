"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, Menu, X, Globe, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const { language, cycleLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  // Search Logic
  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowSearch(false);
      setIsOpen(false);
    }
  };

  // Sidebar Variants (Left to Right Animation)
  const sidebarVariants = {
    closed: { x: "-100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] bg-black/90 backdrop-blur-md border-b border-spiritual-gold/30 shadow-sm h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex justify-between items-center">
          
          {/* Logo */}
          <Link href="/">
            <h1 className="text-2xl text-white font-bold bg-clip-text text-transparent bg-gradient-to-r from-spiritual-light to-spiritual-amber tracking-wide">
              श्री Hitkunj
            </h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-gray-100 hover:text-spiritual-amber font-medium">{t('nav_home')}</Link>
            <Link href="/library/rasik-sant" className="text-gray-100 hover:text-spiritual-amber font-medium">{t('nav_saints')}</Link>
            <Link href="/library/pad-gayan" className="text-gray-100 hover:text-spiritual-amber font-medium">{t('nav_music')}</Link>
            {/* <Link href="/nitya-paath" className="text-gray-100 hover:text-spiritual-amber font-medium">Nitya Paath</Link> New Link */}
            {/* <Link href="/astyam-seva-padati" className="text-gray-100 hover:text-spiritual-amber font-medium">astyam seva</Link> New Link */}
            <Link href="/naam-jap" className="text-gray-100 hover:text-spiritual-amber font-medium">{t('naam_jap')}</Link> {/* New Link */}

            <div className="flex items-center space-x-3 border-l border-spiritual-gold/30 pl-4">
              <button onClick={() => setShowSearch(!showSearch)} className="p-2 rounded-full text-gray-200 hover:bg-gray-800">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={cycleLanguage} className="px-3 py-1 border border-spiritual-gold rounded-full text-xs font-bold text-spiritual-gold hover:bg-amber-400/20 transition flex items-center gap-1">
                <Globe className="w-3 h-3" /> {language}
              </button>
            </div>
          </div>

          {/* Mobile Buttons */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setShowSearch(!showSearch)}>
               <Search className="w-5 h-5 text-gray-100" />
            </button>
            <button onClick={() => setIsOpen(true)} className="text-gray-100 p-2">
               <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Search Bar Dropdown */}
        <AnimatePresence>
          {showSearch && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-gray-900 border-b border-spiritual-sky/30 overflow-hidden absolute w-full top-16 left-0 z-50">
              <form onSubmit={handleSearch} className="max-w-3xl mx-auto p-4 flex gap-2">
                <input name="search" type="text" placeholder={t('search_placeholder')} className="w-full px-4 py-2 rounded-lg border border-spiritual-sky/50 bg-black text-white focus:outline-none focus:ring-2 focus:ring-spiritual-gold" autoFocus />
                <button type="submit" className="bg-spiritual-dark text-white px-6 py-2 rounded-lg"><Search className="w-5 h-5" /></button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MOBILE SIDEBAR (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 z-[150] md:hidden backdrop-blur-sm"
            />
            
            {/* Sidebar Content */}
            <motion.div
              variants={sidebarVariants}
              initial="closed" animate="open" exit="closed"
              className="fixed top-0 left-0 h-full w-[80%] max-w-sm bg-gray-900 border-r border-gray-800 z-[160] shadow-2xl overflow-y-auto"
            >
              <div className="p-5 flex justify-between items-center border-b border-gray-800">
                <h2 className="text-xl font-bold text-spiritual-amber">Menu</h2>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
              </div>

              <div className="flex flex-col p-4 space-y-2">
                {[
                  { href: "/", label: t('nav_home') },
                  { href: "/library/rasik-sant", label: t('nav_saints') },
                  { href: "/library/pad-gayan", label: t('nav_music') },
                  { href: "/nitya-paath", label: "Nitya Paath 📖" },
                  { href: "/ashtyam-seva", label: "Ashtyam Seva 🕰️" },
                  { href: "/naam-jap", label: "Naam Jap 📿" },
                ].map((item) => (
                  <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className="flex items-center justify-between p-3 rounded-lg text-gray-200 hover:bg-gray-800 hover:text-spiritual-amber transition">
                    <span className="text-lg">{item.label}</span>
                    <ChevronRight size={16} className="text-gray-600"/>
                  </Link>
                ))}
                
                <div className="mt-4 pt-4 border-t border-gray-800">
                   <button onClick={cycleLanguage} className="w-full text-left px-3 py-3 rounded-md text-spiritual-amber hover:bg-gray-800 flex items-center gap-2">
                      <Globe className="w-4 h-4" /> Language: {language}
                   </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}