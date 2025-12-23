"use client";
import { useState, useEffect } from "react";
import { Search, CheckCircle2, XCircle, Loader2, RefreshCw, Smartphone, Calendar, User } from "lucide-react";

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    const cachedData = localStorage.getItem("hitkunj_admin_users");
    const lastFetch = localStorage.getItem("hitkunj_users_timestamp");
    
    if (cachedData) {
      setUsers(JSON.parse(cachedData));
      setLoading(false);
    }

    const now = Date.now();
    const twoMinutes = 2 * 60 * 1000;

    if (!lastFetch || (now - lastFetch) > twoMinutes) {
      fetchUsers(!!cachedData);
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

  // Status Badge Component (Reused for Mobile & Desktop)
  const StatusBadge = ({ status }) => (
    status === 'Subscribed' ? 
      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit uppercase tracking-tighter border border-green-200">
        <CheckCircle2 size={10}/> Active
      </span> : 
      <span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit uppercase tracking-tighter border border-red-200">
        <XCircle size={10}/> Inactive
      </span>
  );

  return (
    <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-gray-200 min-h-[400px] relative">
      
      {/* Sync Indicator */}
      {isSyncing && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse border border-amber-100">
          <RefreshCw size={12} className="animate-spin" /> SYNCING...
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-black">User Directory</h2>
            <p className="text-xs text-gray-400 font-bold mt-1">Total Users: {users.length}</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            placeholder="Search name or ID..."
            className="pl-10 p-3 border rounded-xl w-full md:w-64 text-black focus:ring-2 focus:ring-amber-400 outline-none bg-gray-50 md:bg-white"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="text-amber-500 animate-spin" size={48} />
          <p className="text-gray-500 font-bold">Loading Users...</p>
        </div>
      ) : (
        <>
          {/* --- MOBILE VIEW (CARDS) - Visible only on small screens --- */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filtered.length > 0 ? (
                filtered.map((user, i) => (
                    <div key={i} className="border border-gray-100 rounded-2xl p-4 bg-gray-50 shadow-sm flex flex-col gap-3">
                        {/* Top Row: Name and Status */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="bg-white p-2 rounded-full border border-gray-200 text-gray-500">
                                    <User size={16} />
                                </div>
                                <span className="font-bold text-black text-sm">{user.name || "Anonymous"}</span>
                            </div>
                            <StatusBadge status={user.status} />
                        </div>

                        {/* Middle Row: ID */}
                        <div className="bg-white p-2 rounded-lg border border-gray-100 flex items-center gap-2">
                            <Smartphone size={14} className="text-gray-400" />
                            <code className="text-[10px] text-blue-600 font-mono break-all leading-tight">
                                {user.userId}
                            </code>
                        </div>

                        {/* Bottom Row: Date */}
                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium ml-1">
                            <Calendar size={12} />
                            <span>Joined: {user.date}</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-10 text-gray-400 font-medium italic">No users found.</div>
            )}
          </div>

          {/* --- DESKTOP VIEW (TABLE) - Visible only on medium+ screens --- */}
          <div className="hidden md:block overflow-x-auto">
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
                      <td className="p-4 font-bold text-black flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <User size={16}/>
                         </div>
                         {user.name || "Anonymous"}
                      </td>
                      <td className="p-4 font-mono text-[10px] text-blue-600 break-all max-w-[150px]">{user.userId}</td>
                      <td className="p-4"><StatusBadge status={user.status} /></td>
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
        </>
      )}

      {/* Manual Refresh Button */}
      {!loading && (
        <button 
            onClick={() => fetchUsers(false)} 
            className="mt-6 text-xs font-bold text-gray-400 hover:text-black flex items-center gap-1 transition mx-auto md:mx-0"
        >
            <RefreshCw size={12} /> Force Refresh Data
        </button>
      )}
    </div>
  );
}