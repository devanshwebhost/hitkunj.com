"use client";
import { useState, useEffect } from 'react';
import { Bell, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function NotificationsPage() {
  const { t, language } = useLanguage();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications/list')
      .then(res => res.json())
      .then(data => {
        if(data.success) setNotifications(data.notifications);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-amber-100 p-3 rounded-full text-amber-600">
            <Bell size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t('Notification')}</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-amber-500" size={40} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <Bell className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-xl font-medium text-gray-600">No notifications yet</h3>
            <p className="text-gray-400">Updates and alerts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{notif.title}</h3>
                    <p className="text-gray-600 leading-relaxed mb-3">{notif.message}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {notif.date}
                      </span>
                    </div>
                  </div>
                  {notif.url && (
                    <Link href={notif.url} className="text-amber-600 hover:text-amber-700 p-2 bg-amber-50 rounded-lg">
                      <ExternalLink size={20} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}