"use client";
import { useState } from "react";
// ✅ Import the Server Action
import { verifyAdminPassword } from "./actions"; 

import { LayoutDashboard, Users, Bell, BarChart3, Settings, Lock, Power, Info, Calendar, FolderCog } from "lucide-react"; 

// Components Imports
import DashboardOverview from "@/components/admin/DashboardOverview"; 
import ContentManager from "@/components/admin/ContentManager";
import FolderManager from "@/components/admin/FolderManager";
// import UserManager from "@/components/admin/UserManager";
// import NotificationManager from "@/components/admin/NotificationManager";
import EventManager from "@/components/admin/EventManager"; 
import AboutManager from "@/components/admin/AboutManager";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false); // ✅ Loading state for better UX
  
  const [activeTab, setActiveTab] = useState("dashboard");

  // ✅ Updated Login Logic (Secure)
  const handleLogin = async () => {
    setLoading(true);
    try {
      // Server se check karwayein
      const isValid = await verifyAdminPassword(password);
      
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        alert("❌ गलत पासवर्ड (Wrong Password)");
        setPassword(""); // Clear input
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Something went wrong");
    }
    setLoading(false);
  };

  // Allow Enter key to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
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
            className="w-full p-4 border-2 border-gray-400 rounded-xl mb-6 text-black font-medium focus:outline-none focus:border-black transition"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            onKeyDown={handleKeyDown}
          />
          <button 
            onClick={handleLogin} 
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? "Checking..." : "Enter Panel"}
          </button>
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
        
        {/* Dashboard */}
        <NavButton active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")} icon={<LayoutDashboard size={20}/>} label="Dashboard" />
        
        <div className="h-px bg-gray-100 my-2"></div>

        {/* Content Management Group */}
        <NavButton active={activeTab === "content"} onClick={() => setActiveTab("content")} icon={<Settings size={20}/>} label="Content Manager" />
        <NavButton active={activeTab === "folders"} onClick={() => setActiveTab("folders")} icon={<FolderCog size={20}/>} label="Folder Manager" />

        <div className="h-px bg-gray-100 my-2"></div>

        <NavButton active={activeTab === "events"} onClick={() => setActiveTab("events")} icon={<Calendar size={20}/>} label="Utsav Manager" />
        
        {/* About Section (Agar aapne add kiya tha) */}
        {/* <NavButton active={activeTab === "about"} onClick={() => setActiveTab("about")} icon={<Info size={20}/>} label="About Section" /> */}
        {/* ✅ NEW ABOUT MANAGER TAB */}
        <NavButton active={activeTab === "about"} onClick={() => setActiveTab("about")} icon={<Info size={20}/>} label="About Section" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto">
        {activeTab === "dashboard" && <DashboardOverview />}
        {activeTab === "content" && <ContentManager />}
        {activeTab === "folders" && <FolderManager />}
        {activeTab === "events" && <EventManager />}
        {activeTab === "about" && <AboutManager />} {/* ✅ Render New Component */}
      </main>
    </div>
  );
}

// NavButton Component
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