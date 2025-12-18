"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";
import FeedbackForm from '@/components/FeedbackForm';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeClient({ trendingData = [] }) {
  const { t, language } = useLanguage();
  const [displayData, setDisplayData] = useState(trendingData);

  // ✅ Language change hone par Titles update karna
  useEffect(() => {
    if (!trendingData.length) return;

    const updated = trendingData.map(item => {
        let title = item.defaultTitle;

        // Language Logic
        if (language === 'HI' && item.titles?.HI) {
            title = item.titles.HI;
        } else if (item.titles?.EN) {
            title = item.titles.EN;
        }

        return { ...item, displayTitle: title };
    });

    setDisplayData(updated);

  }, [language, trendingData]);

  return (
    <main className="min-h-screen bg-divine-gradient">
      
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
          <Link href="/lab">
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

      

      {/* ✅ MOST VIEWED SECTION (No Loading Spinner) */}
      <section className="max-w-6xl mx-auto px-4 py-8 mb-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-spiritual-dark bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-yellow-500">
             {t('most_viewed_title') || "Trending Now 🌟"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {displayData.map((item, index) => (
                <Link key={item.id} href={item.link}>
                    <div className="bg-white rounded-2xl shadow-lg border border-amber-100 hover:shadow-2xl hover:scale-105 transition transform cursor-pointer relative overflow-hidden group flex flex-col h-full">
                        
                        {/* Badge */}
                        <div className="absolute top-0 right-0 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-20 shadow-sm flex flex-col items-end">
                            <span>#{index + 1} Trending</span>
                            <span className="text-[10px] opacity-80 uppercase">{item.type}</span>
                        </div>

                        {/* Image Section */}
                        <div className="h-48 w-full overflow-hidden relative bg-gray-100">
                            <img 
                                src={item.image} 
                                alt={item.displayTitle} 
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-700 ease-in-out" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Content Section */}
                        <div className="p-5 flex flex-col flex-1 justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-amber-600 transition mb-2 line-clamp-2">
                                    {item.displayTitle}
                                </h3>
                                <div className="h-1 w-12 bg-amber-200 rounded-full mb-3"></div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm text-gray-500 mt-2 border-t pt-3 border-gray-100">
                                <span className="flex items-center gap-1">
                                    👁️ {item.views} <span className="text-xs">Views</span>
                                </span>
                                <span className="text-amber-600 font-medium group-hover:underline text-xs uppercase tracking-wide">
                                    Open {item.type === 'folder' ? 'Folder' : 'Pad'} →
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
          </div>

          {displayData.length === 0 && (
              <div className="text-center py-10 bg-white/50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 italic">Start exploring to see trends!</p>
              </div>
          )}
      </section>
      {/* Static Section */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-shrink-0">
            <img
              src="\radha-naam.jpeg"
              alt="radha"
              className="w-56 h-56 md:w-64 md:h-64 rounded-full object-cover border-4 border-amber-200 shadow-md"
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              श्रीराधासुधानिधि स्तोत्रम्
            </h2>
            <blockquote className="border-l-4 border-amber-400 pl-4 italic text-black bg-amber-50 py-4 pr-4 rounded-md">
              यस्याः कदापि वसनाञ्चल खेलनोत्थ-धन्यातिधन्य पवनेन कृतार्थमानी। <br/>
              योगीन्द्रदुर्गमगति र्मधुसूदनोऽपि तस्यानमोऽस्तु वृषभानुभुवो दिशेऽपि ॥
            </blockquote>
            <blockquote className="border-l-4 border-amber-400 pl-4 italic text-blue-800 bg-amber-50 py-4 pr-4 rounded-md">
             अर्थ:- जिनके नीलाञ्चल के हिलने से उठे हुये धन्यातिधन्य पवन के स्पर्श से, योगीन्द्रों के लिये अति दुर्गम गति वाले मधुसूदन भी अपने आपको कृतकृत्य मानते हैं, मैं उन श्रीवृषभानुनन्दिनी जी की दिशा को भी नमस्कार करता हूँ।
            </blockquote>
            <p className="mt-4 text-sm text-gray-500">
              — श्री हित हरिवंश महाप्रभु जी <Link href="/lab" className='text-blue-600 italic'>See more</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Recommendation Section */}
      {/* <div className="pb-20 px-4">
        <FeedbackForm />
      </div> */}
    </main>
  );
}