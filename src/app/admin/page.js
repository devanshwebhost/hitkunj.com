"use client";
import { useState } from "react";
import { LayoutDashboard, Users, Bell, BarChart3, Settings, Lock, Power, Calendar } from "lucide-react"; // Calendar Icon add kiya

// Components
import ContentManager from "@/components/admin/ContentManager";
import UserManager from "@/components/admin/UserManager";
import NotificationManager from "@/components/admin/NotificationManager";
import EventManager from "@/components/admin/EventManager"; // ✅ Import New Component

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("content");

  const handleLogin = () => {
    if (password === "radhe") setIsAuthenticated(true);
    else alert("Wrong Password");
  };

  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center border-2 border-gray-300">
          <Lock className="mx-auto mb-4 text-black" size={48} />
          <h2 className="text-2xl font-bold mb-6 text-black">Admin Login</h2>
          <input 
            type="password" 
            placeholder="Enter Seva Code" 
            className="w-full p-4 border-2 border-gray-400 rounded-xl mb-6 text-black font-medium"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button onClick={handleLogin} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition">Enter Panel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-72 bg-white border-r border-gray-200 p-6 flex flex-col gap-2">
        <div className="mb-10">
           <h1 className="text-2xl font-black text-black">HitKunj Admin</h1>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Sewa Management</p>
        </div>
        
        <NavButton active={activeTab === "content"} onClick={() => setActiveTab("content")} icon={<Settings size={20}/>} label="Content Manager" />
        <NavButton active={activeTab === "events"} onClick={() => setActiveTab("events")} icon={<Calendar size={20}/>} label="Utsav Manager" /> {/* ✅ New Button */}
        <NavButton active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={<Users size={20}/>} label="User Directory" />
        <NavButton active={activeTab === "notifications"} onClick={() => setActiveTab("notifications")} icon={<Bell size={20}/>} label="Notifications" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10">
        {activeTab === "content" && <ContentManager />}
        {activeTab === "events" && <EventManager />} {/* ✅ Render Component */}
        {activeTab === "users" && <UserManager />}
        {activeTab === "notifications" && <NotificationManager />}
      </main>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-4 rounded-xl font-bold transition-all
        ${active ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}
      `}
    >
      {icon} {label}
    </button>
  );
}