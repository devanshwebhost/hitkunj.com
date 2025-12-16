"use client";
import { useState } from "react";
import { Save, Lock, Wand2, Info } from "lucide-react"; // Info icon added

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [formData, setFormData] = useState({
    rowId: "",
    category: "",
    type: "",
    image: "",
    audioUrl: "",
    title_HI: "",
    title_EN: "",
    title_HING: "",
    desc_HI: "",
    desc_EN: "",
    desc_HING: "",
    content_HI: "",
    content_EN: "",
    content_HING: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // --- HELPER: ID GENERATOR ---
  const generateId = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // AUTOMATIC ID GENERATION LOGIC
      if (name === "title_EN") {
        newData.rowId = generateId(value);
      }

      return newData;
    });
  };

  const handleLogin = () => {
    if (password === "radhe") setIsAuthenticated(true);
    else alert("Wrong Password");
  };

  // --- UPDATED SAVE LOGIC ---
  const handleSave = async () => {
    if (!formData.rowId) return alert("ID is required! Please enter an English Title.");

    setLoading(true);
    // User ko batao ki hum check kar rahe hain
    setStatus("Checking ID & Saving...");

    try {
      const res = await fetch("/api/update-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (data.success) {
        // Server ab humein bata raha hai ki 'Created' hua ya 'Updated'
        // Example Message: "🎉 New Entry Created!" OR "✅ Old Entry Updated!"
        setStatus(data.message); 
      } else {
        setStatus(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Network Error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- LOGIN SCREEN ---------------- */
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 text-center border-2 border-gray-300">
          <Lock className="mx-auto mb-4 text-black" size={40} />
          <h2 className="text-2xl font-bold mb-4 text-black">Admin Login</h2>
          <input
            type="password"
            placeholder="Enter Seva Code"
            className="w-full p-3 border-2 border-gray-400 rounded-lg mb-4 text-black font-medium focus:border-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-bold text-lg transition"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- ADMIN PANEL ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-300">
        <h1 className="text-4xl font-extrabold mb-8 text-black border-b-4 border-amber-400 inline-block pb-2">
          HitKunj Data Entry
        </h1>

        {/* AUTOMATIC ID SECTION */}
        <div className="bg-amber-50 p-6 rounded-xl mb-8 border-2 border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="text-amber-600" size={20} />
            <label className="font-bold text-lg text-black">
              Sheet ID (Auto-Generated)
            </label>
          </div>
          
          {/* Logic Explanation for User */}
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3 bg-white p-2 rounded border border-gray-200">
            <Info size={16} className="mt-1 flex-shrink-0 text-blue-500"/>
            <p>
              <b>Smart Logic:</b> If this ID already exists in the sheet, the data will be <b>UPDATED (Edited)</b>.<br/>
              If this ID is new, a <b>NEW ENTRY</b> will be created automatically.
            </p>
          </div>

          <input
            name="rowId"
            value={formData.rowId}
            readOnly
            className="w-full p-4 bg-gray-100 border-2 border-gray-300 rounded-lg text-lg font-mono font-bold text-gray-600 cursor-not-allowed"
          />
        </div>

        {/* META INFO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {[
            ["category", "Category"],
            ["type", "Type"],
            ["image", "Image URL"],
            ["audioUrl", "Audio URL"],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="block text-sm font-bold text-black mb-1">
                {label}
              </label>
              <input
                name={name}
                value={formData[name]}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-400 rounded-lg text-black font-medium focus:border-black"
              />
            </div>
          ))}
        </div>

        {/* TITLES */}
        <h3 className="text-xl font-bold text-black mb-3 bg-gray-200 p-2 rounded">Titles</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* TITLE ENGLISH - THIS GENERATES THE ID */}
          <div className="bg-blue-50 p-2 rounded border border-blue-200">
            <label className="text-xs font-bold text-blue-800 block mb-1">
              Title (English) ★ Generates ID
            </label>
            <input
              name="title_EN"
              value={formData.title_EN}
              placeholder="e.g. Shri Hith Harivansh"
              onChange={handleChange}
              className="w-full p-3 border-2 border-blue-400 rounded-lg text-black font-bold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Title (Hindi)</label>
            <input
              name="title_HI"
              value={formData.title_HI}
              placeholder="Title (Hindi)"
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-400 rounded-lg text-black font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1">Title (Hinglish)</label>
            <input
              name="title_HING"
              value={formData.title_HING}
              placeholder="Title (Hinglish)"
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-400 rounded-lg text-black font-medium"
            />
          </div>
        </div>

        {/* DESCRIPTIONS */}
        <h3 className="text-xl font-bold text-black mb-3 bg-gray-200 p-2 rounded">Short Descriptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            ["desc_HI", "Desc (Hindi)"],
            ["desc_EN", "Desc (English)"],
            ["desc_HING", "Desc (Hinglish)"],
          ].map(([name, ph]) => (
            <div key={name}>
              <label className="text-xs font-bold text-gray-600 block mb-1">{ph}</label>
              <textarea
                name={name}
                value={formData[name]}
                placeholder={ph}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-400 rounded-lg h-24 text-black font-medium"
              />
            </div>
          ))}
        </div>

        {/* MAIN CONTENT SECTION */}
        <h3 className="text-2xl font-bold text-black mb-4 border-b-2 border-black pb-2">Main Content (Biography)</h3>
        
        <div className="space-y-8">
          {/* Hindi Content */}
          <div>
            <label className="font-bold text-lg text-black block mb-2 bg-amber-200 inline-block px-2 rounded">
              Content (Hindi) - Main
            </label>
            <textarea
              name="content_HI"
              value={formData.content_HI}
              rows={12}
              placeholder="Paste Hindi Biography Here..."
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-500 rounded-xl text-black font-mono text-base focus:border-black"
            />
          </div>

          {/* English Content */}
          <div>
            <label className="font-bold text-lg text-black block mb-2 bg-blue-100 inline-block px-2 rounded">
              Content (English)
            </label>
            <textarea
              name="content_EN"
              value={formData.content_EN}
              rows={8}
              placeholder="Paste English Content Here..."
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-400 rounded-xl text-black font-mono text-base focus:border-black"
            />
          </div>

          {/* Hinglish Content */}
          <div>
            <label className="font-bold text-lg text-black block mb-2 bg-green-100 inline-block px-2 rounded">
              Content (Hinglish)
            </label>
            <textarea
              name="content_HING"
              value={formData.content_HING}
              rows={8}
              placeholder="Paste Hinglish Content Here..."
              onChange={handleChange}
              className="w-full p-4 border-2 border-gray-400 rounded-xl text-black font-mono text-base focus:border-black"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <span className={`text-xl font-bold ${status.includes('Error') ? 'text-red-600' : 'text-green-700'}`}>
            {status}
          </span>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full md:w-auto bg-black hover:bg-gray-800 text-white px-10 py-4 rounded-full font-bold text-lg transition shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? "Checking..." : <><Save size={24}/> Save Entry</>}
          </button>
        </div>
      </div>
    </div>
  );
}