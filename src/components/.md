"use client";
import { useState, useEffect } from 'react';
import { Smartphone } from 'lucide-react';

export default function FloatingActions() {
  const [showInstall, setShowInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    // Sirf Install Prompt ka logic bacha hai
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstall(false);
      // Optional: Agar aap Sheet me 'Install' track karna chahte hain bina OneSignal ID ke
      saveInstallAnalytics(); 
    }
  };

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

  if (!showInstall) return null;

  return (
    <div className="fixed right-5 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-50">
      <button 
        onClick={handleInstallClick} 
        className="bg-orange-600 p-3 rounded-full shadow-lg text-white animate-bounce tooltip-container"
        title="Install App"
      >
        <Smartphone size={24} />
      </button>
    </div>
  );
}