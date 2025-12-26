"use client";
import { useUser } from '@/context/UserContext';
import { useState } from 'react';
import Link from 'next/link';

export default function FloatingActions() {
  const { userData, incrementJap } = useUser();
  const [showTooltip, setShowTooltip] = useState(true);

  // Auto-hide tooltip after 5 seconds
  setTimeout(() => setShowTooltip(false), 5000);

  // Calculate if close to goal
  const percent = (userData.naamJap.count / userData.naamJap.longTermGoal) * 100;

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-[90] flex flex-col items-end gap-2">
       
       {/* Motivation Popup */}
       {showTooltip && (
         <div className="bg-white text-black text-xs font-bold p-2 rounded-lg shadow-xl mb-2 animate-bounce max-w-[120px] text-center">
            {percent > 90 ? "Goal ke pass ho! Japo!" : "Naam Jap start karo!"}
         </div>
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
          <div className="absolute right-16 top-0 hidden group-hover:flex bg-black/80 text-white p-2 rounded whitespace-nowrap">
             Total: {userData.naamJap.count}
          </div>
       </div>

       {/* Link to Page */}
       <Link href="/naam-jap" className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg text-xs hover:bg-gray-700">
          Page
       </Link>
    </div>
  );
}