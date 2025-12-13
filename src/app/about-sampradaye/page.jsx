"use client";
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Heart, BookOpen, Music, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAboutData } from '@/hooks/useAboutData';

// ... imports same rahenge

export default function AboutPage() {
  const { language } = useLanguage();
  const { data: aboutContent, loading } = useAboutData();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!aboutContent) return <div>Data not available</div>;

  return (
    <div className="min-h-screen bg-divine-gradient">
      <Navbar />

      {/* HERO SECTION (Same as before) */}
      <div className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src={aboutContent.heroDesc?.image || "https://images.unsplash.com/photo-1582562144372-972161f38e07?q=80&w=1200&auto=format&fit=crop"}
            alt="Vrindavan Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="relative z-10 text-white max-w-4xl">
          <span className="text-spiritual-gold font-bold tracking-widest uppercase text-sm md:text-base mb-2 block">{aboutContent.heroTag?.[language]}</span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">{aboutContent.heroTitle?.[language]}</h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">{aboutContent.heroDesc?.[language]}</p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        
        {/* ============================================================ */}
        {/* --- Section A: Intro (TEXT WRAPPING FIXED) --- */}
        {/* ============================================================ */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          className="mb-20 clearfix block" // 'block' layout zaroori hai
        >
          {/* IMAGE CONTAINER 
             - Code mein pehle rakha hai taaki float kaam kare.
             - md:float-right: Desktop par right side chipkega.
             - md:ml-10: Left side margin taaki text touch na ho.
          */}
          <div className="relative w-full md:w-1/2 h-80 mb-6 md:mb-4 md:ml-12 md:float-right rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500">
            <img 
              src={aboutContent.imgCaption?.image || "/about-imgs/mahaprabhuji.jpeg"} 
              alt="Shri Hit Harivansh" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white text-center font-bold">
                {aboutContent.imgCaption?.[language]}
              </p>
            </div>
          </div>

          {/* TEXT CONTENT */}
          {/* Ab ye text image ke bagal mein aur phir neeche flow karega */}
          <div className="text-[#FFD54F] text-lg leading-relaxed text-justify font-serif">
            <h2 className="text-3xl font-bold text-spiritual-dark mb-6 border-l-4 border-spiritual-amber pl-4 inline-block">
              {aboutContent.introTitle?.[language]}
            </h2>
            
            <p className="mb-4 text-white">
              {aboutContent.introP1?.[language]}
            </p>
            
            <p className='text-white'>
               {aboutContent.introP2?.[language]}
            </p>
            
            {/* Agar aur text hota to wo image ke neeche apne aap aa jata */}
            
          </div>
        </motion.div>
        {/* ============================================================ */}


        {/* --- Section B: 3 Cards (Principles) --- (Same as before) */}
        <div className="mb-20 text-[#FFD54F]">
          <h2 className="text-3xl font-bold text-center text-spiritual-dark mb-12">
            {aboutContent.sectionTitle?.[language]}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div whileHover={{ y: -10 }} className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-spiritual-sky">
              <div className="bg-spiritual-light w-14 h-14 rounded-full flex items-center justify-center mb-6 text-spiritual-dark"><Heart size={28} /></div>
              <h3 className="text-xl font-bold text-spiritual-dark mb-3">{aboutContent.card1Title?.[language]}</h3>
              <p className="text-gray-600">{aboutContent.card1Desc?.[language]}</p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-spiritual-amber">
              <div className="bg-amber-100 w-14 h-14 rounded-full flex items-center justify-center mb-6 text-amber-600"><Star size={28} /></div>
              <h3 className="text-xl font-bold text-spiritual-dark mb-3">{aboutContent.card2Title?.[language]}</h3>
              <p className="text-gray-600">{aboutContent.card2Desc?.[language]}</p>
            </motion.div>

            <motion.div whileHover={{ y: -10 }} className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-spiritual-sky">
              <div className="bg-spiritual-light w-14 h-14 rounded-full flex items-center justify-center mb-6 text-spiritual-dark"><Music size={28} /></div>
              <h3 className="text-xl font-bold text-spiritual-dark mb-3">{aboutContent.card3Title?.[language]}</h3>
              <p className="text-gray-600">{aboutContent.card3Desc?.[language]}</p>
            </motion.div>
          </div>
        </div>

        {/* --- Section C: Quote Banner --- (Same as before) */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-spiritual-dark rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="w-64 h-64 bg-spiritual-gold rounded-full blur-3xl absolute -top-10 -left-10"></div>
             <div className="w-64 h-64 bg-spiritual-sky rounded-full blur-3xl absolute -bottom-10 -right-10"></div>
          </div>
          <BookOpen className="w-12 h-12 text-spiritual-gold mx-auto mb-6" />
          <blockquote className="text-2xl md:text-4xl font-serif text-white leading-snug mb-6">"आशास्य-दास्यं-वृषभानुजाया- स्तीरे समध्यास्य च भानुजाया:।
कदा नु वृन्दावन-कुञ्ज-वीथी- ष्वहं नु राधे ह्यतिथिर्भवेयम्।। " <br/>
<span className='italic text-xl'>— श्री हित महाप्रभु, श्री राधा सुधा निधि (197)</span></blockquote>
          <p className="text-gray-300">{aboutContent.footerQuote?.[language]}</p>
        </motion.div>

      </div>
    </div>
  );
}