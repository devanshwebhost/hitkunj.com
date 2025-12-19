"use client";
import { useState, useEffect } from 'react';
import { Smartphone, Bell } from 'lucide-react'; // react-icons install karein: npm install react-icons

export default function FloatingActions() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [userId, setUserId] = useState(null);

  // 1. User ID Logic (Browser fingerprinting jaisa)
  useEffect(() => {
    let storedId = localStorage.getItem('hitkunj_uid');
    if (!storedId) {
      storedId = crypto.randomUUID(); // Naya ID banao
      localStorage.setItem('hitkunj_uid', storedId);
    }
    setUserId(storedId);
  }, []);

  // 2. Install Prompt & Status Check Logic
  useEffect(() => {
    // Check if App is already installed (Standalone mode)
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (isApp) {
      setShowInstall(false); // Agar app khuli hai to button mat dikhao
    } else {
      // Browser event capture karo
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        
        // Agar localStorage me likha hai ki installed hai, to shayad uninstalled kiya ho, isliye check event se hi karein
        setShowInstall(true); 
      });
    }

    // 3. OneSignal Check Logic
    if (window.OneSignalDeferred) {
        window.OneSignalDeferred.push(async function(OneSignal) {
            const isPushEnabled = OneSignal.User.PushSubscription.optedIn;
            // Agar subscribe nahi hai, tabhi button dikhao
            setShowSubscribe(!isPushEnabled);
            
            // Listener: Agar user manually subscribe kare
            OneSignal.User.PushSubscription.addEventListener("change", (event) => {
                setShowSubscribe(!event.current.optedIn);
                if(event.current.optedIn) syncToSheet('subscribe', 'Subscribed');
            });
        });
    }

  }, [userId]); // userId dependency taaki update hone par sync ho sake

  // 4. API Sync Function
  const syncToSheet = async (action, status) => {
    if(!userId) return;
    try {
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, status }),
      });
    } catch (err) {
      console.error("Sync Error", err);
    }
  };

  // 5. Handlers
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstall(false);
      syncToSheet('install', 'Installed');
    }
    setDeferredPrompt(null);
  };

  const handleSubscribeClick = () => {
    if (window.OneSignal) {
      window.OneSignal.User.PushSubscription.optIn();
      // 'change' listener upar handle karega sync aur button hiding
    }
  };

  // Agar dono buttons hidden hain to kuch mat render karo
  if (!showInstall && !showSubscribe) return null;

  return (
    <div className="fixed right-5 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
      
      {/* Install Button */}
      {showInstall && (
        <button 
          onClick={handleInstallClick}
          className="bg-orange-600 hover:bg-orange-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center animate-bounce tooltip-container"
          title="Install App"
        >
          <Smartphone size={24} />
          {/* Mobile view me text hide kar sakte hain agar chahein */}
        </button>
      )}


    </div>
  );
}