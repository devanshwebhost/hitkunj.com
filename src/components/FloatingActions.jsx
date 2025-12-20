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

    // 2. OneSignal Logic
    if (window.OneSignalDeferred) {
      window.OneSignalDeferred.push(async function(OneSignal) {
        // Initial Check
        const isOptedIn = OneSignal.User.PushSubscription.optedIn;
        setShowSubscribe(!isOptedIn);

        // Listener: Jab state change ho (Chahe box se ho ya bell se)
        OneSignal.User.PushSubscription.addEventListener("change", async (event) => {
          const optedIn = event.current.optedIn;
          setShowSubscribe(!optedIn); // Agar on hua to button chupa do

          if (optedIn) {
            const osId = event.current.id; // Correct OneSignal ID
            await handleSync(osId);
          }
        });
      });
    }
  }, []);

  const handleSync = async (osId) => {
    // Pehle check karo local storage me naam hai kya (EventBox ne save kiya hoga)
    let userName = localStorage.getItem('hitkunj_user_name');
    
    // Agar naam nahi hai, tabhi prompt dikhao
    if (!userName) {
      userName = prompt("Radhe Radhe! Kripya apna naam likhein (Notification ke liye):");
      if (!userName) userName = "Rasik Premi";
      localStorage.setItem('hitkunj_user_name', userName);
    }

    // Save to Sheet
    try {
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: osId, 
          name: userName, 
          action: 'subscribe', 
          status: 'Subscribed' 
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
    if (outcome === 'accepted') setShowInstall(false);
  };

  return (
    <div className="fixed right-5 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
      {showInstall && (
        <button onClick={handleInstallClick} className="bg-orange-600 p-3 rounded-full shadow-lg text-white animate-bounce tooltip-container">
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