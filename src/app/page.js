"use client"
import Navbar from '@/components/Navbar';
import FeedbackForm from '@/components/FeedbackForm';
import { useLanguage } from '@/context/LanguageContext';

  

export default function Home() {
  
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-divine-gradient">
      <Navbar />
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pt-20 pb-10 px-4 text-center">
        <h1 className="text-2xl md:text-7xl font-bold text-spiritual-dark mb-6 drop-shadow-sm">
          {t('hero_title')}
        </h1>
        <p className="text-[20px] md:text-xl text-gray-700 max-w-2xl mb-8 leading-relaxed">
          {t('hero_desc')}
        </p>
        
        <div className="flex gap-4">
          <button className=" bg-spiritual-amber text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-yellow-600 transition">
            {t('btn_explore')}
          </button>
          <button className="bg-white text-black text-spiritual-dark border-2 border-spiritual-sky px-8 py-3 rounded-full font-bold shadow-lg hover:bg-spiritual-light transition">
            {t('btn_about')}
          </button>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-black">
        {/* Sections ke naam bhi dynamic */}
        {[
          { key: 'section_sant', label: t('section_sant') },
          { key: 'section_pad', label: t('section_pad') },
          { key: 'section_utsav', label: t('section_utsav') }
        ].map((item) => (
          <div key={item.key} className="bg-white/70 p-8 rounded-xl shadow-md border-t-4 border-spiritual-sky hover:shadow-xl transition cursor-pointer">
            <h2 className="text-2xl font-bold text-spiritual-dark mb-2">{item.label}</h2>
            <p className="text-gray-600">Click to explore...</p>
          </div>
        ))}
      </div>

      {/* Recommendation Section */}
      <div className="pb-20 px-4">
        <FeedbackForm />
      </div>
    </main>
  );
}