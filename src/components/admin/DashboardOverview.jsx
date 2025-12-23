"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";
import { BarChart3, Users, FileText, Calendar, TrendingUp, Loader2, Eye } from "lucide-react";

export default function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalContent: 0,
    totalSubscribers: 0,
    activeEvents: 0
  });
  const [topContent, setTopContent] = useState([]);

  useEffect(() => {
    fetchAllStats();
  }, []);

  const fetchAllStats = async () => {
    try {
      // 1. Fetch Analytics (Views)
      const analyticsSnapshot = await get(ref(db, 'analytics'));
      let viewsCount = 0;
      let analyticsArray = [];

      if (analyticsSnapshot.exists()) {
        const data = analyticsSnapshot.val();
        Object.keys(data).forEach(key => {
            const item = data[key];
            const v = parseInt(item.views || 0);
            viewsCount += v;
            analyticsArray.push({ id: key, ...item });
        });
      }

      // Sort for Top 5 Content
      const sortedContent = analyticsArray.sort((a, b) => b.views - a.views).slice(0, 5);
      setTopContent(sortedContent);

      // 2. Fetch Content Items Count
      const contentSnapshot = await get(ref(db, 'content_items'));
      const contentCount = contentSnapshot.exists() ? Object.keys(contentSnapshot.val()).length : 0;

      // 3. Fetch Subscribers Count
      const usersSnapshot = await get(ref(db, 'notifications_users'));
      let subsCount = 0;
      if (usersSnapshot.exists()) {
          // Count only valid subscriptions
          const users = usersSnapshot.val();
          subsCount = Object.values(users).filter(u => u.subscription).length;
      }

      // 4. Fetch Active Events
      const eventsSnapshot = await get(ref(db, 'upcoming_events'));
      let activeEventsCount = 0;
      if (eventsSnapshot.exists()) {
          const events = eventsSnapshot.val();
          const today = new Date();
          today.setHours(0,0,0,0);
          
          Object.values(events).forEach(evt => {
              const start = new Date(evt.startDate || evt.date);
              const end = new Date(evt.endDate || evt.startDate || evt.date);
              end.setHours(23,59,59);
              if (today >= start && today <= end) activeEventsCount++;
          });
      }

      setStats({
        totalViews: viewsCount,
        totalContent: contentCount,
        totalSubscribers: subsCount,
        activeEvents: activeEventsCount
      });

    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-amber-600" size={40} /></div>;
  }

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
            <h2 className="text-3xl font-black text-black">Dashboard Overview</h2>
            <p className="text-gray-500">Welcome back, Sewak Ji.</p>
        </div>
        <div className="text-sm font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            Live Data
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Views" 
            value={stats.totalViews.toLocaleString()} 
            icon={<Eye className="text-blue-600" />} 
            color="bg-blue-50 border-blue-200"
        />
        <StatCard 
            title="Library Items" 
            value={stats.totalContent} 
            icon={<FileText className="text-purple-600" />} 
            color="bg-purple-50 border-purple-200"
        />
        <StatCard 
            title="Subscribers" 
            value={stats.totalSubscribers} 
            icon={<Users className="text-green-600" />} 
            color="bg-green-50 border-green-200"
        />
        <StatCard 
            title="Live Utsavs" 
            value={stats.activeEvents} 
            icon={<Calendar className="text-amber-600" />} 
            color="bg-amber-50 border-amber-200"
        />
      </div>

      {/* TOP CONTENT TABLE */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8">
        <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2">
            <TrendingUp className="text-red-500" /> Top Performing Content
        </h3>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-gray-400 text-sm border-b border-gray-100">
                        <th className="pb-3 font-bold">Title</th>
                        <th className="pb-3 font-bold">Type</th>
                        <th className="pb-3 font-bold text-right">Views</th>
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {topContent.map((item, index) => (
                        <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                            <td className="py-4 font-bold flex items-center gap-3">
                                <span className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold
                                    ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-200 text-gray-500'}
                                `}>
                                    {index + 1}
                                </span>
                                {item.title || item.id}
                            </td>
                            <td className="py-4">
                                <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 rounded text-gray-500">
                                    {item.type || 'General'}
                                </span>
                            </td>
                            <td className="py-4 text-right font-mono font-bold text-blue-600">
                                {item.views.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

    </div>
  );
}

// Simple Helper Component for Cards
function StatCard({ title, value, icon, color }) {
    return (
        <div className={`p-6 rounded-2xl border ${color} shadow-sm transition hover:shadow-md`}>
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
            </div>
            <h4 className="text-gray-500 font-bold text-sm uppercase tracking-wide">{title}</h4>
            <p className="text-3xl font-black text-black mt-1">{value}</p>
        </div>
    );
}