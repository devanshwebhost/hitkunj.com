"use client";
import { useState, useEffect, useMemo } from "react";
import { Save, Lock, Wand2, Info, Search, Trash2, XCircle, AlertTriangle, Sparkles, Power } from "lucide-react";

// Google App Script URL
const DATA_URL = "https://script.google.com/macros/s/AKfycbxVjOJt2oR_5aqAaLILycms2eGD6eqhFLLiuZxyVuRURxH-jfHvylya6lE17wGYY09C/exec";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [status, setStatus] = useState("");
  const [isAutoTranslateEnabled, setIsAutoTranslateEnabled] = useState(true); // ✅ New State for Toggle

  // Data States
  const [existingItems, setExistingItems] = useState([]);
  const [sheetCategories, setSheetCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);

  const initialFormState = {
    rowId: "",
    category: "",
    folder: "",
    folder_HI: "", // ✅ Initialized as empty string
    type: "",
    image: "",
    audioUrl: "",
    title_HI: "", title_EN: "", title_HING: "",
    desc_HI: "", desc_EN: "", desc_HING: "",
    content_HI: "", content_EN: "", content_HING: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- 1. FETCH DATA ---
  useEffect(() => {
    if (isAuthenticated) fetchExistingData();
  }, [isAuthenticated]);

  const fetchExistingData = async () => {
    try {
      const res = await fetch(DATA_URL);
      const data = await res.json();

      if (data && typeof data === 'object') {
        setSheetCategories(Object.keys(data));
      }

      let allItems = [];
      Object.values(data).forEach(cat => {
        if (cat.items) allItems = [...allItems, ...cat.items];
      });
      setExistingItems(allItems);

    } catch (err) {
      console.error("Failed to load data");
      setStatus("❌ Failed to load Sheet Data");
    }
  };

  // --- 2. DROPDOWN LISTS ---
  const { uniqueFolders, allCategories, uniqueTypes } = useMemo(() => {
    const folders = new Set();
    const categories = new Set([...sheetCategories]);
    const types = new Set(["audio", "text"]);

    existingItems.forEach(item => {
      if (item.folder) folders.add(item.folder);
      if (item.category) categories.add(item.category);
      if (item.type) types.add(item.type);
    });

    return {
      uniqueFolders: [...folders],
      allCategories: [...categories],
      uniqueTypes: [...types]
    };
  }, [existingItems, sheetCategories]);

  // --- 3. AUTO TRANSLATE LOGIC ---
  const translateText = async (text, targetLang) => {
    if (!text) return "";
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0].map(x => x[0]).join("");
    } catch (err) {
      console.error("Translation Failed", err);
      return text;
    }
  };

  const handleAutoTranslate = async (fieldName) => {
    if (!isAutoTranslateEnabled) return; // ✅ Check if feature is enabled

    const hinglishText = formData[fieldName];
    if (!hinglishText) return;

    setTranslating(true);

    // Determine target fields
    let targetHI = "";
    let targetEN = "";

    if (fieldName === "title_HING") { targetHI = "title_HI"; targetEN = "title_EN"; }
    else if (fieldName === "desc_HING") { targetHI = "desc_HI"; targetEN = "desc_EN"; }
    else if (fieldName === "content_HING") { targetHI = "content_HI"; targetEN = "content_EN"; }

    // Translate Main Fields
    if (targetHI && targetEN) {
      const [hindi, english] = await Promise.all([
        translateText(hinglishText, "hi"),
        translateText(hinglishText, "en")
      ]);

      setFormData(prev => ({
        ...prev,
        [targetHI]: hindi,
        [targetEN]: english
      }));

      // If Title English is filled, generate ID
      if (fieldName === "title_HING" && !isEditing) {
        const newId = generateId(english);
        setFormData(prev => ({ ...prev, rowId: newId }));
        const exists = existingItems.some(item => item.id === newId);
        setDuplicateError(exists);
      }
    }

    // ✅ Folder Auto-Translate Logic
    if (fieldName === "folder") {
      const hindiFolder = await translateText(hinglishText, "hi");
      setFormData(prev => ({ ...prev, folder_HI: hindiFolder }));
    }

    setTranslating(false);
  };

  // --- 4. SELECTION & CANCEL ---
  const handleSelectToEdit = (item) => {
    setIsEditing(true);
    setDuplicateError(false);
    setFormData({
      rowId: item.id || "",
      category: item.category || "",
      folder: item.folder || "",
      folder_HI: item.folder_HI || "", // ✅ Safe fallback
      type: item.type || "",
      image: item.image || "",
      audioUrl: item.audioUrl || "",
      title_HI: item.title?.HI || "",
      title_EN: item.title?.EN || "",
      title_HING: item.title?.HING || "",
      desc_HI: item.desc?.HI || "",
      desc_EN: item.desc?.EN || "",
      desc_HING: item.desc?.HING || "",
      content_HI: item.fullContent?.HI || "",
      content_EN: item.fullContent?.EN || "",
      content_HING: item.fullContent?.HING || "",
    });
    setSearchTerm("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStatus("✏️ Editing: " + item.title?.EN);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDuplicateError(false);
    setFormData(initialFormState);
    setStatus("");
    setSearchTerm("");
  };

  const generateId = (text) => {
    return text.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "title_EN" && !isEditing) {
        const newId = generateId(value);
        newData.rowId = newId;
        const exists = existingItems.some(item => item.id === newId);
        setDuplicateError(exists);
      }
      return newData;
    });
  };

  // --- 5. SAVE & DELETE ---
  const handleSave = async () => {
    if (!formData.rowId) return alert("ID is required!");
    if (duplicateError) return alert("Cannot save! ID already exists.");

    setLoading(true);
    setStatus("Saving...");

    try {
      const res = await fetch("/api/update-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(data.message);
        fetchExistingData();
        if (!isEditing) handleCancel();
      } else setStatus(`❌ Error: ${data.message}`);
    } catch (err) {
      setStatus("❌ Network Error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("⚠️ Are you sure you want to DELETE this item?")) return;
    setLoading(true);
    setStatus("Deleting...");
    try {
      const res = await fetch("/api/update-sheet", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rowId: formData.rowId }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("🗑️ Deleted Successfully!");
        handleCancel();
        fetchExistingData();
      } else setStatus(`❌ Error: ${data.message}`);
    } catch (err) {
      setStatus("❌ Error Deleting");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    if (password === "radhe") setIsAuthenticated(true);
    else alert("Wrong Password");
  };

  const filteredItems = existingItems.filter(item =>
    item.title?.EN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------------- UI RENDER ---------------- */
  if (!isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-96 text-center border-2 border-gray-300">
          <Lock className="mx-auto mb-4 text-black" size={40} />
          <h2 className="text-2xl font-bold mb-4 text-black">Admin Login</h2>
          <input type="password" placeholder="Enter Seva Code" className="w-full p-3 border-2 border-gray-400 rounded-lg mb-4 text-black font-medium" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button onClick={handleLogin} className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-bold text-lg transition">Enter</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-300">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-extrabold text-black border-b-4 border-amber-400 inline-block pb-2">
                HitKunj Admin
              </h1>
              {/* ✅ AUTO TRANSLATE TOGGLE */}
              <button 
                onClick={() => setIsAutoTranslateEnabled(!isAutoTranslateEnabled)}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition w-fit
                  ${isAutoTranslateEnabled ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-200 text-gray-500 border-gray-300'}
                `}
              >
                <Power size={14} />
                Auto-Translate: {isAutoTranslateEnabled ? "ON" : "OFF"}
              </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96 z-10">
            <div className={`flex items-center border-2 rounded-full px-4 py-2 ${isEditing ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed' : 'bg-amber-50 border-amber-400'}`}>
              <Search className="text-amber-600 mr-2" size={20} />
              <input
                type="text"
                placeholder={isEditing ? "Cancel editing to search" : "🔍 Search to Edit..."}
                disabled={isEditing}
                className="bg-transparent outline-none w-full text-black placeholder-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && !isEditing && (
              <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 overflow-y-auto">
                {filteredItems.map(item => (
                  <div key={item.id} onClick={() => handleSelectToEdit(item)} className="p-3 hover:bg-amber-100 cursor-pointer border-b border-gray-100 text-black flex justify-between">
                    <span className="font-bold">{item.title?.EN}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{item.folder || "No Folder"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STATUS BAR */}
        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Info className="text-blue-600" />
              <span className="text-blue-900 font-bold">You are editing an existing item. ID cannot be changed.</span>
            </div>
            <button onClick={handleCancel} className="bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 flex items-center gap-2">
              <XCircle size={18} /> Cancel Selection
            </button>
          </div>
        )}

        {/* TRANSLATION LOADING INDICATOR */}
        {translating && (
          <div className="fixed top-4 right-4 bg-black text-white px-6 py-3 rounded-full shadow-2xl z-50 flex items-center gap-2 animate-bounce">
            <Sparkles className="text-yellow-400" size={20} /> Translating...
          </div>
        )}

        {/* ID SECTION */}
        <div className={`p-6 rounded-xl mb-8 border-2 flex justify-between items-center ${duplicateError ? 'bg-red-50 border-red-400' : 'bg-amber-50 border-amber-200'}`}>
          <div className="w-full">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className={duplicateError ? "text-red-600" : "text-amber-600"} size={20} />
              <label className="font-bold text-lg text-black">Unique ID (Auto-Generated)</label>
            </div>

            <input
              name="rowId"
              value={formData.rowId}
              readOnly
              className={`w-full p-4 border-2 rounded-lg text-lg font-mono font-bold cursor-not-allowed ${duplicateError ? 'bg-red-100 text-red-700 border-red-300' : 'bg-gray-100 text-gray-600 border-gray-300'}`}
            />
            {duplicateError && <div className="mt-2 text-red-600 font-bold flex items-center gap-2 animate-pulse"><AlertTriangle size={18} /> This ID already exists!</div>}
          </div>

          {isEditing && (
            <button onClick={handleDelete} className="ml-4 bg-red-100 text-red-600 hover:bg-red-600 hover:text-white p-4 rounded-xl transition border border-red-200 flex flex-col items-center min-w-[100px]">
              <Trash2 size={24} />
              <span className="text-xs font-bold mt-1">DELETE</span>
            </button>
          )}
        </div>

        {/* --- METADATA INPUTS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* FOLDER (English/Hinglish) */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">Folder (English/Hinglish)</label>
            <div className="relative">
              <input
                list="folders-list"
                name="folder"
                value={formData.folder}
                onChange={handleChange}
                onBlur={() => handleAutoTranslate("folder")} // ✨ Auto Translate (Conditional)
                placeholder="e.g. Bhori Sakhi"
                className="w-full p-3 border-2 border-amber-400 bg-amber-50 rounded-lg text-black font-bold"
              />
              {isAutoTranslateEnabled && <span className="absolute right-2 top-3 text-xs text-amber-600 bg-white px-1 rounded border border-amber-200">✨ Auto</span>}
            </div>
            <datalist id="folders-list">{uniqueFolders.map(f => <option key={f} value={f} />)}</datalist>
          </div>

          {/* FOLDER (Hindi) */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">Folder (Hindi)</label>
            <input
              name="folder_HI"
              value={formData.folder_HI}
              onChange={handleChange}
              placeholder="e.g. भोरी सखी"
              className="w-full p-3 border-2 border-gray-400 rounded-lg text-black bg-gray-50"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">Category</label>
            <input list="categories-list" name="category" value={formData.category} onChange={handleChange} placeholder="Select Category" className="w-full p-3 border-2 border-gray-400 rounded-lg text-black" />
            <datalist id="categories-list">{allCategories.map(c => <option key={c} value={c} />)}</datalist>
          </div>

          {/* TYPE */}
          <div>
            <label className="block text-sm font-bold text-black mb-1">Type</label>
            <input list="types-list" name="type" value={formData.type} onChange={handleChange} placeholder="audio / text" className="w-full p-3 border-2 border-gray-400 rounded-lg text-black" />
            <datalist id="types-list">{uniqueTypes.map(t => <option key={t} value={t} />)}</datalist>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div><label className="block text-sm font-bold text-black mb-1">Image URL</label><input name="image" value={formData.image} onChange={handleChange} className="w-full p-3 border-2 border-gray-400 rounded-lg text-black" /></div>
          <div><label className="block text-sm font-bold text-black mb-1">Audio URL</label><input name="audioUrl" value={formData.audioUrl} onChange={handleChange} className="w-full p-3 border-2 border-gray-400 rounded-lg text-black" /></div>
        </div>

        {/* --- TITLES --- */}
        <h3 className="text-xl font-bold text-black mb-3 bg-gray-200 p-2 rounded flex justify-between">
          Titles
          {isAutoTranslateEnabled && <span className="text-xs text-gray-500 font-normal mt-1">★ Type in Hinglish & click outside to auto-translate</span>}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <input
              name="title_HING"
              value={formData.title_HING}
              onChange={handleChange}
              onBlur={() => handleAutoTranslate("title_HING")} // ✨ MAGIC (Conditional)
              placeholder="Title (Hinglish) - Type Here!"
              className="w-full p-3 border-2 border-amber-400 bg-amber-50 rounded-lg text-black font-bold focus:ring-2 focus:ring-amber-500"
            />
            {isAutoTranslateEnabled && <span className="absolute right-2 top-3 text-xs text-amber-600 bg-white px-1 rounded border border-amber-200">✨ Auto</span>}
          </div>

          <input name="title_HI" value={formData.title_HI} onChange={handleChange} placeholder="Title (Hindi)" className="w-full p-3 border-2 border-gray-300 rounded-lg text-black bg-gray-50" />

          <div className="relative">
            <input name="title_EN" value={formData.title_EN} onChange={handleChange} placeholder="Title (English)" className={`w-full p-3 border-2 rounded-lg text-black bg-gray-50 ${duplicateError ? 'border-red-500' : 'border-gray-300'}`} />
            {isEditing && <span className="absolute right-2 top-3 text-xs text-gray-400 bg-white px-1">Locked</span>}
          </div>
        </div>

        {/* --- DESCRIPTIONS --- */}
        <h3 className="text-xl font-bold text-black mb-3 bg-gray-200 p-2 rounded">Short Description</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <textarea
              name="desc_HING"
              value={formData.desc_HING}
              onChange={handleChange}
              onBlur={() => handleAutoTranslate("desc_HING")} // ✨ MAGIC (Conditional)
              placeholder="Desc (Hinglish) - Type Here!"
              className="w-full p-3 border-2 border-amber-400 bg-amber-50 rounded-lg h-24 text-black font-medium"
            />
            {isAutoTranslateEnabled && <span className="absolute right-2 top-3 text-xs text-amber-600 bg-white px-1 rounded border border-amber-200">✨ Auto</span>}
          </div>
          <textarea name="desc_HI" value={formData.desc_HI} onChange={handleChange} placeholder="Desc (Hindi)" className="w-full p-3 border-2 border-gray-300 rounded-lg h-24 text-black bg-gray-50" />
          <textarea name="desc_EN" value={formData.desc_EN} onChange={handleChange} placeholder="Desc (English)" className="w-full p-3 border-2 border-gray-300 rounded-lg h-24 text-black bg-gray-50" />
        </div>

        {/* --- CONTENT --- */}
        <h3 className="text-2xl font-bold text-black mb-4 border-b-2 border-black pb-2">Main Content</h3>
        <div className="space-y-6">

          {/* HINGLISH CONTENT */}
          <div>
            <label className="font-bold text-lg text-black block mb-2 bg-amber-100 inline-block px-2 rounded border border-amber-300">
              Content (Hinglish) {isAutoTranslateEnabled ? "- Type Here for Magic ✨" : "- Auto-Translate OFF"}
            </label>
            <textarea
              name="content_HING"
              value={formData.content_HING}
              onChange={handleChange}
              onBlur={() => handleAutoTranslate("content_HING")} // ✨ MAGIC (Conditional)
              rows={6}
              placeholder="Type in Hinglish..."
              className="w-full p-4 border-2 border-amber-400 bg-amber-50 rounded-xl text-black font-mono focus:border-black"
            />
          </div>

          <textarea name="content_HI" value={formData.content_HI} onChange={handleChange} rows={6} placeholder="Hindi Content..." className="w-full p-4 border-2 border-gray-300 bg-gray-50 rounded-xl text-black font-mono text-base" />
          <textarea name="content_EN" value={formData.content_EN} onChange={handleChange} rows={6} placeholder="English Content..." className="w-full p-4 border-2 border-gray-300 bg-gray-50 rounded-xl text-black font-mono" />
        </div>

        {/* FOOTER */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <span className={`text-xl font-bold ${status.includes('Error') ? 'text-red-600' : 'text-green-700'}`}>{status}</span>

          <div className="flex gap-4 w-full md:w-auto">
            {isEditing && (
              <button onClick={handleCancel} className="flex-1 md:flex-none border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-6 py-4 rounded-full font-bold text-lg transition">
                Cancel
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={loading || duplicateError}
              className={`flex-1 md:flex-none px-10 py-4 rounded-full font-bold text-lg transition shadow-lg flex items-center justify-center gap-2 text-white
                  ${duplicateError ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'}
                `}
            >
              {loading ? "Processing..." : <><Save size={24} /> {isEditing ? "Update Entry" : "Save New Entry"}</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}