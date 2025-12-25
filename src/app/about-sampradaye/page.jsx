"use client";
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAboutData } from '@/hooks/useAboutData';
import Link from 'next/link';

export default function AboutPage() {
  const { language } = useLanguage(); // language can be 'HI', 'EN', or 'HING'
  const { data: aboutContent, loading } = useAboutData();

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Helper to safely get text based on language (fallback to EN if missing)
  const getTxt = (obj) => {
    if (!obj) return "";
    return obj[language] || obj['EN'] || obj['HI'] || "";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  if (!aboutContent) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Data not available</div>;

  return (
    <div className="min-h-screen bg-divine-gradient">

      {/* HERO SECTION */}
      <div className="relative h-[60vh] w-full overflow-hidden flex items-center justify-center text-center px-4">
        <div className="absolute inset-0 z-0">
          <img 
            src={aboutContent.heroDesc?.image || "https://images.unsplash.com/photo-1582562144372-972161f38e07"}
            alt="Vrindavan Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="relative z-10 text-white max-w-4xl">
          <span className="text-spiritual-gold font-bold tracking-widest uppercase text-sm md:text-base mb-2 block">
            {getTxt(aboutContent.heroTag)}
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
            {getTxt(aboutContent.heroTitle)}
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto leading-relaxed">
            {getTxt(aboutContent.heroDesc)}
          </p>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        
        {/* SECTION A: Intro */}
        <motion.div 
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
          className="mb-20 clearfix block" 
        >
          <div className="relative w-full md:w-1/2 h-80 mb-6 md:mb-4 md:ml-12 md:float-right rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition-all duration-500">
            <img 
              src={aboutContent.imgCaption?.image || "/logo-png.png"} 
              alt="Shri Hit Harivansh" 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-white text-center font-bold">
                {getTxt(aboutContent.imgCaption)}
              </p>
            </div>
          </div>

          <div className="text-[#FFD54F] text-lg leading-relaxed text-justify font-serif">
            <h2 className="text-3xl font-bold text-spiritual-dark mb-6 border-l-4 border-spiritual-amber pl-4 inline-block">
              {getTxt(aboutContent.introTitle)}
            </h2>
            <p className="mb-4 text-white whitespace-pre-line">{getTxt(aboutContent.introP1)}</p>
            <p className='text-white whitespace-pre-line'>{getTxt(aboutContent.introP2)}</p>
          </div>
        </motion.div>

        {/* --- SECTION B: DYNAMIC FEATURED ITEMS --- */}
        <div className="mb-20 text-[#FFD54F]">
          <h2 className="text-3xl font-bold text-center text-spiritual-dark mb-12">
            {getTxt(aboutContent.sectionTitle) || "Featured Collections"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aboutContent.featuredItems && aboutContent.featuredItems.length > 0 ? (
                aboutContent.featuredItems.map((item, index) => {
                    // Manual extraction because items are in array, not objects with HI/EN keys directly
                    const title = item[`title_${language}`] || item.title_EN;
                    const desc = item[`desc_${language}`] || item.desc_EN;

                    return (
                        <Link key={index} href={item.link || '#'} className="group">
                            <motion.div 
                                whileHover={{ y: -10 }} 
                                className="bg-white rounded-2xl shadow-lg overflow-hidden border-t-4 border-spiritual-amber h-full flex flex-col"
                            >
                                <div className="h-48 overflow-hidden relative">
                                    <img src={item.image || "/logo-png.png"} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-spiritual-dark mb-2 group-hover:text-amber-600 transition">
                                        {title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-4 flex-1">
                                        {desc}
                                    </p>
                                    <span className="text-spiritual-amber font-bold text-sm flex items-center gap-1">
                                        {language === 'HI' ? "अभी देखें" : "Explore Now"} <ArrowRight size={16}/>
                                    </span>
                                </div>
                            </motion.div>
                        </Link>
                    )
                })
            ) : (
                <div className="col-span-3 text-center text-gray-400 italic">
                    {language === 'HI' ? "कोई संग्रह उपलब्ध नहीं है।" : "No featured items yet."}
                </div>
            )}
          </div>
        </div>

        {/* SECTION C: Quote Banner */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="bg-spiritual-dark rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
             <div className="w-64 h-64 bg-spiritual-gold rounded-full blur-3xl absolute -top-10 -left-10"></div>
             <div className="w-64 h-64 bg-spiritual-sky rounded-full blur-3xl absolute -bottom-10 -right-10"></div>
          </div>
          <BookOpen className="w-12 h-12 text-spiritual-gold mx-auto mb-6" />
          <blockquote className="text-xl md:text-3xl font-serif text-white leading-snug mb-6 whitespace-pre-line">
              {getTxt(aboutContent.footerQuote)}
          </blockquote>
        </motion.div>

      </div>
    </div>
  );
}