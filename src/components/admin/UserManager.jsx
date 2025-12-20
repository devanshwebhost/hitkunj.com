"use client";
import { useState, useEffect } from "react";
import { Search, CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Sirf first time ke liye
  const [isSyncing, setIsSyncing] = useState(false); // Background sync indicator
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    // 1. Pehle LocalStorage se data uthao
    const cachedData = localStorage.getItem("hitkunj_admin_users");
    const lastFetch = localStorage.getItem("hitkunj_users_timestamp");
    
    if (cachedData) {
      setUsers(JSON.parse(cachedData));
      setLoading(false); // Data mil gaya, loader hatao
    }

    // 2. Check karo ki kya background sync ki zaroorat hai (e.g. 2 min se zyada purana data)
    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000;

    if (!lastFetch || (now - lastFetch) > twoMinutes) {
      fetchUsers(!!cachedData); // silent sync agar data pehle se hai
    } else {
        setLoading(false);
    }
  };

  const fetchUsers = async (isSilent = false) => {
    if (isSilent) setIsSyncing(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/save-user/list");
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.users || []);
        // LocalStorage update karo
        localStorage.setItem("hitkunj_admin_users", JSON.stringify(data.users));
        localStorage.setItem("hitkunj_users_timestamp", Date.now().toString());
      }
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const filtered = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.userId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 min-h-[400px] relative">
      
      {/* Background Syncing Indicator (Chota sa spinner top par) */}
      {isSyncing && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
          <RefreshCw size={12} className="animate-spin" /> SYNCING...
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-extrabold text-black">User Directory</h2>
            <p className="text-xs text-gray-400 font-bold">Total Users: {users.length}</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            placeholder="Search instantly..."
            className="pl-10 p-3 border rounded-xl w-full md:w-64 text-black focus:ring-2 focus:ring-amber-400 outline-none"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="text-amber-500 animate-spin" size={48} />
          <p className="text-gray-500 font-bold">First time loading...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b-2 border-gray-100 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">User / Name</th>
                  <th className="p-4 font-bold">Device ID (OneSignal)</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((user, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="p-4 font-bold text-black">{user.name || "Anonymous"}</td>
                    <td className="p-4 font-mono text-[10px] text-blue-600 break-all max-w-[150px]">{user.userId}</td>
                    <td className="p-4">
                      {user.status === 'Subscribed' ? 
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit uppercase tracking-tighter"><CheckCircle2 size={12}/> Active</span> : 
                        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit uppercase tracking-tighter"><XCircle size={12}/> Inactive</span>
                      }
                    </td>
                    <td className="p-4 text-gray-400 text-xs">{user.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-400 font-medium italic">
              No users found in database.
            </div>
          )}
        </div>
      )}

      {/* Manual Refresh Button (Just in case) */}
      {!loading && (
        <button 
            onClick={() => fetchUsers(false)} 
            className="mt-6 text-xs font-bold text-gray-400 hover:text-black flex items-center gap-1 transition"
        >
            <RefreshCw size={12} /> Force Refresh Data
        </button>
      )}
    </div>
  );
}