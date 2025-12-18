"use client";
import { useEffect } from 'react';

export default function OneSignalSetup() {
  useEffect(() => {
    // Sirf client-side par run karein
    if (typeof window !== "undefined") {
      window.OneSignal = window.OneSignal || [];
      
      // OneSignal Load karein
      const script = document.createElement('script');
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.async = true;
      document.head.appendChild(script);

      window.OneSignal.push(function() {
        window.OneSignal.init({
          appId: "dfeec41a-62c5-4bd8-b15e-dd5cdfda0075", // ⚠️ Yahan apni App ID dalein
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: false, // Default bell icon hatane ke liye
          },
        });
      });
    }
  }, []);

  return null; // UI me kuch nahi dikhayega
}