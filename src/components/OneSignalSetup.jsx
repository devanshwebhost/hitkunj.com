"use client";
import { useEffect } from 'react';

export default function OneSignalSetup() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Setup Deferred Array (Official Way)
    window.OneSignalDeferred = window.OneSignalDeferred || [];

    // 2. Push Initialization Logic
    window.OneSignalDeferred.push(async function(OneSignal) {
      await OneSignal.init({
        appId: "dfeec41a-62c5-4bd8-b15e-dd5cdfda0075", // ✅ Aapki App ID
        allowLocalhostAsSecureOrigin: false, // Localhost testing ke liye zaroori
        notifyButton: {
          enable: false, // Default bell icon hide karein
        },
      });
      console.log("OneSignal Initialized Successfully");
    });
    

    // 3. Load Script (Agar pehle se nahi hai)
    if (!document.getElementById('onesignal-script')) {
        const script = document.createElement('script');
        script.id = 'onesignal-script';
        script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
        script.defer = true; // ✅ Defer zaroori hai
        document.head.appendChild(script);
    }

  }, []);

  return null;
}