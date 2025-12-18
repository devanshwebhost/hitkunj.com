"use client";
import { useLanguage } from '@/context/LanguageContext';
import { Heart, Instagram, Youtube, Facebook } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-spiritual-dark text-white py-12 mt-16 border-t border-amber-400/30">
  <div className="max-w-6xl mx-auto px-6">

    {/* GRID FIXED — items-start keeps top alignment equal */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start mb-12">

      {/* Column 1 */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-amber-400">
          श्री Hitkunj
        </h2>
        <p className="text-gray-300 text-sm leading-relaxed">
          {t('hero_desc') || "Vrindavan ke Rasik Santon ki vani aur padon ka digital sangrah."}
        </p>
      </div>

      {/* Column 2 */}
      {/* <div className="space-y-4">
        <h3 className="text-lg font-semibold text-amber-300">Quick Links</h3>
        <ul className="space-y-2 text-gray-300 text-sm">
          <li><Link href="/" className="hover:text-amber-400 transition">Home</Link></li>
          <li><Link href="/library/rasik-sant" className="hover:text-amber-400 transition">Rasik Sant</Link></li>
          <li><Link href="/library/pad-gayan" className="hover:text-amber-400 transition">Pad Gayan</Link></li>
          <li><Link href="/library/utsav" className="hover:text-amber-400 transition">Utsav Nirnay</Link></li>
        </ul>
      </div> */}

      {/* Column 3 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-amber-400">Connect</h3>

        <div className="flex space-x-4">
          {[Instagram].map((Icon, i) => (
           <Link href={"https://www.instagram.com/shrihitkunj?igsh=aThtczJvMDVyMjRv"}> <button
              key={i}
              className="p-2 bg-white/10 rounded-full hover:bg-amber-400 hover:text-black transition"
            >
              <Icon size={20} />
            </button>
            </Link>
          ))}
        </div>

        <p className="text-amber-400 italic text-sm">
          "Shri Radha Vallabh Shri Harivansh"
        </p>
      </div>

    </div>

    {/* Bottom Bar */}
    <div className="border-t border-white/10 pt-4 mt-10 flex flex-col md:flex-row items-center justify-between text-gray-400 text-xs">
      <p className='mt-10'>© 2024 श्री Hitkunj. All rights reserved.</p>
      <div className="flex items-center gap-1 mt-2 md:mt-0">
        Made with <Heart size={12} className="text-red-500 fill-red-500" /> By <Link href={"https://indocsmedia.vercel.app"}>Indocs Media</Link>
      </div>
    </div>

  </div>
</footer>

  );
}
