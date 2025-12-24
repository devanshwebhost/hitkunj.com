"use client";
import { useState, useEffect } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";

export default function SubscribeButton() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    }
  };

  const subscribeUser = async () => {
    setLoading(true);
    try {
      // 1. Ask Permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm !== "granted") {
        alert("Notifications permission denied!");
        return;
      }

      // 2. Register Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // 3. Get Push Subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY)
      });

      // 4. Save to Database
      const res = await fetch("/api/save-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription }),
      });

      if (res.ok) {
        setIsSubscribed(true);
        alert("✅ Subscribed successfully!");
      }

    } catch (err) {
      console.error("Subscription Error:", err);
      alert("Failed to subscribe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // VAPID Key Helper Function
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  if (permission === 'denied') {
      return <div className="text-red-500 text-sm mt-2">Notifications are blocked in browser settings.</div>;
  }

  return (
    <button
      onClick={subscribeUser}
      disabled={isSubscribed || loading}
      className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all ${
        isSubscribed 
          ? "bg-green-100 text-green-700 cursor-default" 
          : "bg-black text-white hover:bg-gray-800 hover:scale-105"
      }`}
    >
      {loading ? <Loader2 className="animate-spin" size={20} /> : (
        isSubscribed ? <><Bell size={20} /> Notifications On</> : <><Bell size={20} /> Enable Notifications</>
      )}
    </button>
  );
}