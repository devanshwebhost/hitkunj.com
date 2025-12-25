"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Globe, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ComingSoon() {
  const { t, language, cycleLanguage } = useLanguage();

  return (
    <div className="min-h-screen bg-divine-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor (Optional) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
         <div className="absolute -top-20 -left-20 w-96 h-96 bg-amber-400 rounded-full blur-3xl"></div>
         <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-400 rounded-full blur-3xl"></div>
      </div>

      {/* Language Switcher (Top Right) */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={cycleLanguage} 
          className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-spiritual-dark font-bold hover:bg-white/40 transition shadow-sm"
        >
          <Globe className="w-4 h-4" />
          <span>{language}</span>
        </button>
      </div>

      {/* Main Content Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center max-w-2xl mx-auto"
      >
        {/* Logo Animation */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="mb-8 flex justify-center"
        >
          <div className="relative w-40 h-40 md:w-52 md:h-52 drop-shadow-2xl">
             <Image 
               src="/logo-png.png" 
               alt="Hitkunj Logo" 
               fill
               className="object-contain"
               priority
             />
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold text-spiritual-dark mb-6 drop-shadow-sm tracking-tight">
          {t('coming_soon_title')}
        </h1>

        {/* Description */}
        <p className="text-lg md:text-2xl text-gray-700 mb-8 leading-relaxed font-serif px-4">
          {t('coming_soon_desc')}
        </p>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mb-8 rounded-full"></div>

        {/* Footer Note */}
        <p className="text-amber-700 font-bold text-xl flex items-center justify-center gap-2">
           <Sparkles className="w-5 h-5" /> {t('stay_tuned')} <Sparkles className="w-5 h-5" />
        </p>

        {/* Action Button (Optional) */}
        {/* <div className="mt-10">
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-3 bg-spiritual-dark text-white rounded-full font-medium hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            {t('back_home')} <ArrowRight className="w-4 h-4" />
          </Link>
        </div> 
        */}

      </motion.div>

      {/* Footer Copyright */}
      <div className="absolute bottom-6 text-center w-full text-gray-500 text-sm">
        © {new Date().getFullYear()} Hitkunj. All rights reserved.
      </div>

    </div>
  );
}