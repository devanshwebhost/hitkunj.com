"use client";
import { useLanguage } from '@/context/LanguageContext';
// ✅ Mail icon import kiya
import { Heart, Instagram, Mail } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const { t } = useLanguage();

  // ✅ Social Links Data Configuration
  const socialLinks = [
    { 
      Icon: Instagram, 
      link: "https://www.instagram.com/shrihitkunj?igsh=aThtczJvMDVyMjRv",
      label: "Instagram"
    },
    { 
      Icon: Mail, 
      link: "mailto:indocsmedia@gmail.com",
      label: "Email"
    }
  ];

  return (
    <footer className="bg-spiritual-dark text-white py-12 mt-16 border-t border-amber-400/30">
      <div className="max-w-6xl mx-auto px-6">

        {/* GRID FIXED — items-start keeps top alignment equal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start mb-12">

          {/* Column 1 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-amber-400">
              Jeevan Harivansh
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('hero_desc') || "Vrindavan ke Rasik Santon ki vani aur padon ka digital sangrah."}
            </p>
          </div>

          {/* Column 2 (Placeholder if needed) */}
          <div className="space-y-4 md:block hidden">
            {/* Empty space or additional links */}
          </div>

          {/* Column 3 - Connect Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-amber-400">Connect</h3>

            {/* ✅ Updated Social Icons Logic */}
            <div className="flex space-x-4">
              {socialLinks.map(({ Icon, link, label }, i) => (
                <Link key={i} href={link} target={link.startsWith('http') ? "_blank" : "_self"}>
                  <button
                    className="p-2 bg-white/10 rounded-full hover:bg-amber-400 hover:text-black transition flex items-center justify-center"
                    aria-label={label}
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
        <div className="border-t border-white/10 pt-8 mt-10 flex flex-col md:flex-row items-center justify-between text-gray-400 text-xs">
          
          <div className="flex flex-col md:flex-row gap-4 mb-4 md:mb-0 text-center md:text-left">
             <p>© 2025 <Link href={''}>Teenera Pvt. Ltd.</Link> All rights reserved.</p>
             <div className="hidden md:block text-gray-600">|</div>
             <div className="flex gap-4 justify-center">
                <Link href="/privacy" className="hover:text-amber-400 transition">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-amber-400 transition">Terms & Conditions</Link>
             </div>
          </div>

          <div className="flex items-center gap-1">
            Made with <Heart size={12} className="text-red-500 fill-red-500" /> By <Link href={"https://indocsmedia.vercel.app"} className="hover:text-white transition">Indocs Media</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}