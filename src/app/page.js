"use client"
import Navbar from '@/components/Navbar';
import FeedbackForm from '@/components/FeedbackForm';
import { useLanguage } from '@/context/LanguageContext';
import Image from "next/image";
import Link from 'next/link';

  

export default function Home() {
  
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-divine-gradient">
      <Navbar />
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center pb-10 px-4 text-center">
         <div className="flex justify-center items-center">
      <Image 
        src="/logo-png.png" 
        alt="Logo"
        width={200} 
        height={100}
        className="object-contain"
      />
    </div>
        <h1 className="text-2xl md:text-7xl font-bold text-spiritual-dark mb-6 drop-shadow-sm">
          {t('hero_title')}
        </h1>
        <p className="text-[20px] md:text-xl text-gray-700 max-w-2xl mb-8 leading-relaxed">
          {t('hero_desc')}
        </p>
        
        <div className="flex gap-4">
          <Link href="/lab-page">
          <button className=" bg-spiritual-amber text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-yellow-600 transition">
            {t('btn_explore')}
          </button>
          </Link>
          <Link href="/about-sampradaye">
          <button className="bg-white text-black text-spiritual-dark border-2 border-spiritual-sky px-8 py-3 rounded-full font-bold shadow-lg hover:bg-spiritual-light transition">
            {t('btn_about')}
          </button>
          </Link>
        </div>
      </div>

      {/* Sections Grid */}
      {/* Sections Grid with Background Images */}
<div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
  {[
    { 
      key: 'section_sant', 
      label: t('section_sant'), 
      // Niche apni local image ka path daal dena (e.g., '/images/sant.jpg')
      image: '/rasik-sant-collage.jpeg' // Placeholder: Sadhu/Temple
    },
    { 
      key: 'section_pad', 
      label: t('section_pad'), 
      image: '/nity-vihar.jpeg' // Placeholder: Music/Vina
    },
    { 
      key: 'section_utsav', 
      label: t('section_utsav'), 
      image: '/radhavallabji.jpeg' // Placeholder: Colors/Utsav
    }
  ].map((item) => (
    <div 
      key={item.key} 
      // 'group' class hover effects ke liye zaroori hai
      className="group relative h-64 overflow-hidden rounded-xl shadow-md border-t-4 border-spiritual-sky hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* 1. Background Image with Zoom Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${item.image})` }}
      />

      {/* 2. Dark Gradient Overlay (Taaki text padha ja sake) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/80 transition-colors duration-300" />

      {/* 3. Text Content */}
      <div className="relative z-10 h-full p-6 flex flex-col justify-end">
        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {item.label}
        </h2>
        
        {/* Hover karne par ye text upar aayega */}
        <p className="text-spiritual-gold font-medium text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
          Go &rarr;
        </p>
      </div>
    </div>
  ))}
</div>
<div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-6">
  {[
    { 
      key: 'radha_keli_kunj', 
      label: t('radha_keli_kunj'), 
      // Niche apni local image ka path daal dena (e.g., '/images/sant.jpg')
      image: '/radha-keli-kunj.jpeg' // Placeholder: Sadhu/Temple
    },
    { 
      key: 'saar_ki_baat', 
      label: t('saar_ki_baat'), 
      image: '/radha-naam.jpeg' // Placeholder: Music/Vina
    },
    { 
      key: 'yugal_lela', 
      label: t('yugal_lela'), 
      image: '/radhavallab-temp.jpeg' // Placeholder: Colors/Utsav
    }
  ].map((item) => (
    <div 
      key={item.key} 
      // 'group' class hover effects ke liye zaroori hai
      className="group relative h-64 overflow-hidden rounded-xl shadow-md border-t-4 border-spiritual-sky hover:shadow-2xl transition-all duration-300 cursor-pointer"
    >
      {/* 1. Background Image with Zoom Effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
        style={{ backgroundImage: `url(${item.image})` }}
      />

      {/* 2. Dark Gradient Overlay (Taaki text padha ja sake) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent group-hover:from-black/80 transition-colors duration-300" />

      {/* 3. Text Content */}
      <div className="relative z-10 h-full p-6 flex flex-col justify-end">
        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          {item.label}
        </h2>
        
        {/* Hover karne par ye text upar aayega */}
        <p className="text-spiritual-gold font-medium text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75">
          Go &rarr;
        </p>
      </div>
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