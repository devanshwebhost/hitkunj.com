"use client";
import { useState, useEffect } from 'react';
import { Smartphone, Bell } from 'lucide-react';

export default function FloatingActions() {
  const [showInstall, setShowInstall] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // 1. Install Prompt Capture
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });

    // 2. OneSignal Status & Sync Logic
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function(OneSignal) {
        const subscription = OneSignal.User.PushSubscription;
        
        // Button kab dikhana hai
        setShowSubscribe(!subscription.optedIn);

        // Jab user subscribe kare
        subscription.addEventListener("change", async (event) => {
          if (event.current.optedIn) {
            const osId = event.current.id; // OneSignal Unique ID
            await handleFirstTimeSync(osId, 'Subscribed');
            setShowSubscribe(false);
          }
        });
      });
    }
  }, []);

  // Naam mangne aur sync karne ka logic
  const handleFirstTimeSync = async (osId, status) => {
    let userName = localStorage.getItem('hitkunj_user_name');
    
    // Agar naam nahi hai, to prompt dikhao
    if (!userName) {
      userName = prompt("Radhe Radhe! Kripya apna naam likhein (Notification ke liye):");
      if (!userName) userName = "Rasik Premi"; // Fallback name
      localStorage.setItem('hitkunj_user_name', userName);
    }

    try {
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: osId, // OneSignal Device ID
          name: userName, 
          action: 'notification', 
          status: status 
        }),
      });
    } catch (err) { console.error("Sync Error", err); }
  };

  const handleSubscribeClick = () => {
    if (window.OneSignal) {
      window.OneSignal.User.PushSubscription.optIn();
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      // Install ke waqt bhi agar OS ID mil jaye to badiya hai
      if(window.OneSignal?.User?.PushSubscription?.id) {
        handleFirstTimeSync(window.OneSignal.User.PushSubscription.id, 'Installed');
      }
    }
  };

  return (
    <div className="fixed right-5 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
      {showInstall && (
        <button onClick={handleInstallClick} className="bg-orange-600 p-3 rounded-full shadow-lg text-white animate-bounce">
          <Smartphone size={24} />
        </button>
      )}

      {showSubscribe && (
        <button onClick={handleSubscribeClick} className="bg-blue-600 p-3 rounded-full shadow-lg text-white hover:scale-110 transition">
          <Bell size={24} />
        </button>
      )}
    </div>
  );
}