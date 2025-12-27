"use client";
import { useUser } from '@/context/UserContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Smartphone } from 'lucide-react'; // ✅ Icon import

export default function FloatingActions() {
  // --- Naam Jap Data ---
  const { userData, incrementJap } = useUser();
  const [showTooltip, setShowTooltip] = useState(true);

  // --- Install App Logic State ---
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // 1. Tooltip Timer Logic
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  // 2. Install Prompt Listener
  useEffect(() => {
    const handler = (e) => {
      // Prevent standard browser install prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install button
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // 3. Handle Install Click
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      saveInstallAnalytics(); 
    }
  };

  // 4. Analytics
  const saveInstallAnalytics = async () => {
    try {
        await fetch('/api/save-user', {
            method: 'POST',
            body: JSON.stringify({ 
                userId: 'pwa-install', 
                name: 'App Installer', 
                action: 'install', 
                status: 'Installed' 
            })
        });
    } catch(e) {}
  };

  // Calculate if close to goal (Safe check included)
  const percent = userData?.naamJap ? (userData.naamJap.count / userData.naamJap.longTermGoal) * 100 : 0;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[90] flex flex-col items-end gap-3">
       
       {/* Motivation Popup */}
       {showTooltip && (
         <div className="bg-white text-black text-xs font-bold p-2 rounded-lg shadow-xl mb-2 animate-bounce max-w-[120px] text-center">
            {percent > 90 ? "Goal ke pass ho! Japo!" : "Naam Jap start karo!"}
         </div>
       )}

       {/* ✅ Install Button (Only visible if installable) */}
       {showInstall && (
        <button 
            onClick={handleInstallClick} 
            className="w-10 h-10 rounded-full bg-orange-600 text-white shadow-lg flex items-center justify-center animate-pulse hover:bg-orange-700 transition"
            title="Install App"
        >
            <Smartphone size={18} />
        </button>
       )}

       {/* Quick Jap Button */}
       <div className="group relative">
          <button 
            onClick={incrementJap}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white font-bold shadow-lg flex items-center justify-center text-xs border-2 border-white"
          >
              राधा
          </button>
          {/* Hover Menu */}
          <div className="absolute right-16 top-0 hidden group-hover:flex bg-black/80 text-white p-2 rounded whitespace-nowrap text-sm">
              Total: {userData?.naamJap?.count || 0}
          </div>
       </div>

       {/* Link to Page */}
       <Link href="/naam-jap" className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg text-xs hover:bg-gray-700">
          Page
       </Link>
    </div>
  );
}