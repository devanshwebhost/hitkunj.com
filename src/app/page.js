"use client"
// import Navbar from '@/components/Navbar';
import FeedbackForm from '@/components/FeedbackForm';
import { useLanguage } from '@/context/LanguageContext';
import Image from "next/image";
import Link from 'next/link';

  

export default function Home() {
  
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-divine-gradient">
      {/* <Navbar /> */}
      
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

      {/* Sections Grid */}
      {/* Sections Grid with Background Images */}
     
      <section class="max-w-5xl mx-auto px-4 py-12">
  <div class="bg-white rounded-3xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row items-center gap-10">

    {/* <!-- 🌸 Image --> */}
    <div class="flex-shrink-0">
      <img
        src="\radha-naam.jpeg"
        alt="radha"
        class="w-56 h-56 md:w-64 md:h-64 rounded-full object-cover border-4 border-amber-200 shadow-md"
      />
    </div>

    {/* <!-- 📜 Content --> */}
    <div class="text-center md:text-left">

      <h2 class="text-3xl font-bold text-gray-900 mb-4">
        श्रीराधासुधानिधि स्तोत्रम्
      </h2>

      {/* <!-- ✨ Pad / Quote --> */}
      <blockquote class="border-l-4 border-amber-400 pl-4 italic text-black bg-amber-50 py-4 pr-4 rounded-md">
        यस्याः कदापि वसनाञ्चल खेलनोत्थ-धन्यातिधन्य पवनेन कृतार्थमानी। <br/>
        योगीन्द्रदुर्गमगति र्मधुसूदनोऽपि तस्यानमोऽस्तु वृषभानुभुवो दिशेऽपि ॥
      </blockquote>
      <blockquote class="border-l-4 border-amber-400 pl-4 italic text-blue-800 bg-amber-50 py-4 pr-4 rounded-md">
       अर्थ:- जिनके नीलाञ्चल के हिलने से उठे हुये धन्यातिधन्य पवन के स्पर्श से, योगीन्द्रों के लिये अति दुर्गम गति वाले मधुसूदन भी अपने आपको कृतकृत्य मानते हैं, मैं उन श्रीवृषभानुनन्दिनी जी की दिशा को भी नमस्कार करता हूँ।
      </blockquote>

      <p class="mt-4 text-sm text-gray-500">
        — श्री हित हरिवंश महाप्रभु जी <Link href="/lab" className='text-blue-600 italic'>See more</Link>
      </p>
      

    </div>

  </div>
</section>

<section>

      <h4 class=" text-center italic font-bold text-amber-100 mb-4">
        Most Viewed folder/pad/biography will be shown here
      </h4>
</section>


      {/* Recommendation Section */}
      <div className="pb-20 px-4">
        <FeedbackForm />
      </div>
    </main>
  );
}