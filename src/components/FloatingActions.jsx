"use client";
import { useState, useEffect } from 'react';
import { Bell, Loader2, CheckCircle } from 'lucide-react';

export default function FloatingActions() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Check subscription status on load
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          if (sub) setIsSubscribed(true);
        });
      });
    }
  }, []);

  const urlBase64ToUint8Array = (base64String) => {
    if (!base64String) return null;
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
  };

  const subscribeUser = async () => {
    setLoading(true);
    try {
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) return alert("VAPID Key Missing!");

      // 1. Register Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // ✅ FIX: Wait for Service Worker to be Ready (Active)
      await navigator.serviceWorker.ready;

      // 2. Subscribe (Ab ye fail nahi hoga)
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });

      // 3. User Info
      let userName = localStorage.getItem('hitkunj_user_name');
      if (!userName) {
        userName = prompt("Radhe Radhe! Notification ke liye apna naam likhein:");
        if (!userName) userName = "Rasik Premi";
        localStorage.setItem('hitkunj_user_name', userName);
      }

      // 4. Save to Sheet
      await fetch('/api/save-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscription: subscription, 
          name: userName 
        }),
      });

      setIsSubscribed(true);
      alert("Notifications Enabled! Jay Radhe!");

    } catch (error) {
      console.error("Subscription Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (isSubscribed) return null;

  return (
    <div className="fixed right-5 top-1/2 transform -translate-y-1/2 z-50">
      <button 
        onClick={subscribeUser} 
        disabled={loading}
        className="bg-blue-600 p-3 rounded-full shadow-lg text-white hover:scale-110 transition flex items-center gap-2"
      >
        {loading ? <Loader2 className="animate-spin" size={24} /> : <Bell size={24} />}
      </button>
    </div>
  );
}