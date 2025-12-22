"use client";
import { useState, useEffect, useMemo } from "react";
import { Save, Wand2, Info, Search, Trash2, XCircle, AlertTriangle, Sparkles, Power, RefreshCw, Image as ImageIcon, Music } from "lucide-react";

export default function ContentManager() {
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [status, setStatus] = useState("");
  const [isAutoTranslateEnabled, setIsAutoTranslateEnabled] = useState(true);
  const [existingItems, setExistingItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);

  const initialFormState = {
    rowId: "", category: "", folder: "", folder_HI: "", type: "", image: "", audioUrl: "",
    title_HI: "", title_EN: "", title_HING: "",
    desc_HI: "", desc_EN: "", desc_HING: "",
    content_HI: "", content_EN: "", content_HING: "",
  };
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => { fetchExistingData(); }, []);

  const fetchExistingData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/update-sheet"); 
      const data = await res.json();
      
      if (data.success && data.data) {
        setExistingItems(data.data);
      } else {
        setStatus("❌ Failed to load Data");
      }
    } catch (err) { 
        console.error(err);
        setStatus("❌ Network Error"); 
    } finally {
        setLoading(false);
    }
  };

  const { uniqueFolders, allCategories, uniqueTypes } = useMemo(() => {
    const folders = new Set();
    const categories = new Set();
    const types = new Set(["audio", "text"]);
    
    existingItems.forEach(item => {
      if (item.folder) folders.add(item.folder);
      if (item.category) categories.add(item.category);
      if (item.type) types.add(item.type);
    });
    return { uniqueFolders: [...folders], allCategories: [...categories], uniqueTypes: [...types] };
  }, [existingItems]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "title_EN" && !isEditing) {
        const newId = generateId(value);
        newData.rowId = newId;
        setDuplicateError(existingItems.some(item => item.id === newId));
      }
      return newData;
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDuplicateError(false);
    setFormData(initialFormState);
    setStatus("");
    setSearchTerm("");
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
    } catch (err) { setStatus("❌ Error Deleting"); }
    finally { setLoading(false); }
  };

  const translateText = async (text, targetLang) => {
    if (!text) return "";
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0].map(x => x[0]).join("");
    } catch (err) { return text; }
  };

  const handleAutoTranslate = async (fieldName) => {
    if (!isAutoTranslateEnabled) return;
    const text = formData[fieldName];
    if (!text) return;
    setTranslating(true);
    let targetHI = "", targetEN = "";
    if (fieldName === "title_HING") { targetHI = "title_HI"; targetEN = "title_EN"; }
    else if (fieldName === "desc_HING") { targetHI = "desc_HI"; targetEN = "desc_EN"; }
    else if (fieldName === "content_HING") { targetHI = "content_HI"; targetEN = "content_EN"; }

    if (targetHI && targetEN) {
      const [hindi, english] = await Promise.all([translateText(text, "hi"), translateText(text, "en")]);
      setFormData(prev => ({ ...prev, [targetHI]: hindi, [targetEN]: english }));
      if (fieldName === "title_HING" && !isEditing) {
        const newId = generateId(english);
        setFormData(prev => ({ ...prev, rowId: newId }));
        setDuplicateError(existingItems.some(item => item.id === newId));
      }
    }
    if (fieldName === "folder") {
        const hindiFolder = await translateText(text, "hi");
        setFormData(prev => ({ ...prev, folder_HI: hindiFolder }));
    }
    setTranslating(false);
  };

  const generateId = (text) => text.toLowerCase().trim().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");

  const handleSelectToEdit = (item) => {
    setIsEditing(true);
    setDuplicateError(false);
    setFormData({
      rowId: item.id || "", 
      category: item.category || "", 
      folder: item.folder || "",
      folder_HI: item.folder_HI || "", 
      type: item.type || "", 
      image: item.image || "",      // ✅ Image yahan se set hogi
      audioUrl: item.audioUrl || "", 
      title_HI: item.title_HI || "", title_EN: item.title_EN || "", title_HING: item.title_HING || "", 
      desc_HI: item.desc_HI || "", desc_EN: item.desc_EN || "", desc_HING: item.desc_HING || "", 
      content_HI: item.content_HI || "", content_EN: item.content_EN || "", content_HING: item.content_HING || "",
    });
    setSearchTerm("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSave = async () => {
    if (!formData.rowId) return alert("ID is required!");
    if (duplicateError) return alert("Cannot save! ID already exists.");
    setLoading(true);
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
      }
    } catch (err) { setStatus("❌ Network Error"); }
    finally { setLoading(false); }
  };

  const filteredItems = existingItems.filter(item => 
    (item.title_EN && item.title_EN.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.id && item.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold text-black border-b-4 border-amber-400 inline-block pb-2">HitKunj Content</h1>
          <button 
            onClick={() => setIsAutoTranslateEnabled(!isAutoTranslateEnabled)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition w-fit ${isAutoTranslateEnabled ? 'bg-green-100 text-green-700 border-green-300' : 'bg-gray-200 text-gray-500 border-gray-300'}`}
          >
            <Power size={14} /> Auto-Translate: {isAutoTranslateEnabled ? "ON" : "OFF"}
          </button>
        </div>
        <div className="relative w-full md:w-96 z-10">
          <div className={`flex items-center border-2 rounded-full px-4 py-2 ${isEditing ? 'bg-gray-100 border-gray-300 opacity-50 cursor-not-allowed' : 'bg-amber-50 border-amber-400'}`}>
            <Search className="text-amber-600 mr-2" size={20} />
            <input
              type="text"
              placeholder={isEditing ? "Cancel editing to search" : "🔍 Search to Edit..."}
              disabled={isEditing}
              className="bg-transparent outline-none w-full text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {loading && <RefreshCw className="animate-spin text-amber-600 ml-2" size={16}/>}
          </div>
          {searchTerm && !isEditing && (
            <div className="absolute top-12 left-0 w-full bg-white border border-gray-200 shadow-xl rounded-xl max-h-60 overflow-y-auto z-50">
              {filteredItems.map(item => (
                <div key={item.id} onClick={() => handleSelectToEdit(item)} className="p-3 hover:bg-amber-100 cursor-pointer text-black flex justify-between border-b">
                  <span className="font-bold">{item.title_EN || item.id}</span>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{item.folder || "No Folder"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-6 flex justify-between items-center">
          <span className="text-blue-900 font-bold flex items-center gap-2"><Info /> Editing existing item. ID is locked.</span>
          <button onClick={handleCancel} className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold border border-red-200 flex items-center gap-2"><XCircle size={18} /> Cancel</button>
        </div>
      )}

      {translating && (
        <div className="fixed top-4 right-4 bg-black text-white px-6 py-3 rounded-full z-50 flex items-center gap-2 animate-bounce">
          <Sparkles className="text-yellow-400" size={20} /> Translating...
        </div>
      )}

      {/* ID FIELD */}
      <div className={`p-6 rounded-xl mb-8 border-2 flex justify-between items-center ${duplicateError ? 'bg-red-50 border-red-400' : 'bg-amber-50 border-amber-200'}`}>
        <div className="w-full">
          <label className="font-bold text-lg text-black flex items-center gap-2 mb-2"><Wand2 size={20}/> Unique ID</label>
          <input name="rowId" value={formData.rowId} readOnly className="w-full p-4 border-2 rounded-lg bg-gray-100 font-mono font-bold text-black" />
          {duplicateError && <div className="mt-2 text-red-600 font-bold flex items-center gap-2"><AlertTriangle size={18} /> ID already exists!</div>}
        </div>
        {isEditing && (
          <button onClick={handleDelete} className="ml-4 bg-red-100 text-red-600 p-4 rounded-xl border border-red-200 flex flex-col items-center hover:bg-red-200 transition">
            <Trash2 size={24} /><span className="text-xs font-bold mt-1">DELETE</span>
          </button>
        )}
      </div>

      {/* FORM FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-black">
        <div>
          <label className="block text-sm font-bold mb-1">Folder (Hinglish/English)</label>
          <input list="folders" name="folder" value={formData.folder} onChange={handleChange} onBlur={() => handleAutoTranslate("folder")} className="w-full p-3 border-2 border-amber-400 rounded-lg" />
          <datalist id="folders">{uniqueFolders.map(f => <option key={f} value={f} />)}</datalist>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Folder (Hindi)</label>
          <input name="folder_HI" value={formData.folder_HI} onChange={handleChange} className="w-full p-3 border-2 border-gray-400 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Category</label>
          <input list="cats" name="category" value={formData.category} onChange={handleChange} className="w-full p-3 border-2 border-gray-400 rounded-lg" />
          <datalist id="cats">{allCategories.map(c => <option key={c} value={c} />)}</datalist>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Type (audio/text)</label>
          <input list="types" name="type" value={formData.type} onChange={handleChange} className="w-full p-3 border-2 border-gray-400 rounded-lg" />
          <datalist id="types">{uniqueTypes.map(t => <option key={t} value={t} />)}</datalist>
        </div>
        
        {/* ✅ NEW: Separate Fields for Image and Audio */}
        <div className="md:col-span-1">
            <label className="text-sm font-bold mb-1 flex items-center gap-2"><ImageIcon size={16}/> Image URL</label>
            <input name="image" value={formData.image} onChange={handleChange} placeholder="https://image-link.com/photo.jpg" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-400 outline-none" />
            {formData.image && <img src={formData.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-md border border-gray-300" />}
        </div>
        <div className="md:col-span-1">
            <label className="text-sm font-bold mb-1 flex items-center gap-2"><Music size={16}/> Audio URL</label>
            <input name="audioUrl" value={formData.audioUrl} onChange={handleChange} placeholder="https://audio-link.com/song.mp3" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-amber-400 outline-none" />
        </div>
      </div>

      {/* TITLES & CONTENT */}
      <div className="space-y-6 text-black">
        <h3 className="text-xl font-bold bg-gray-100 p-2 rounded">Titles (Type Hinglish for Auto)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="title_HING" value={formData.title_HING} onChange={handleChange} onBlur={() => handleAutoTranslate("title_HING")} placeholder="Hinglish" className="p-3 border-2 border-amber-400 rounded-lg" />
          <input name="title_HI" value={formData.title_HI} onChange={handleChange} placeholder="Hindi" className="p-3 border-2 border-gray-300 rounded-lg" />
          <input name="title_EN" value={formData.title_EN} onChange={handleChange} placeholder="English" className="p-3 border-2 border-gray-300 rounded-lg" />
        </div>

        <h3 className="text-xl font-bold bg-gray-100 p-2 rounded">Main Content</h3>
        <textarea name="content_HING" value={formData.content_HING} onChange={handleChange} onBlur={() => handleAutoTranslate("content_HING")} rows={5} className="w-full p-4 border-2 border-amber-400 rounded-xl" placeholder="Hinglish content..." />
        <textarea name="content_HI" value={formData.content_HI} onChange={handleChange} rows={5} className="w-full p-4 border-2 border-gray-300 rounded-xl" placeholder="Hindi content..." />
        <textarea name="content_EN" value={formData.content_EN} onChange={handleChange} rows={5} className="w-full p-4 border-2 border-gray-300 rounded-xl" placeholder="English content..." />
      </div>

      <div className="mt-10 flex justify-between items-center bg-gray-50 p-6 rounded-2xl border">
        <span className={`font-bold ${status.includes('❌') ? 'text-red-600' : 'text-green-700'}`}>{status}</span>
        <button onClick={handleSave} disabled={loading || duplicateError} className="bg-black text-white px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition disabled:opacity-50 flex items-center gap-2">
          {loading ? <RefreshCw className="animate-spin" /> : <><Save /> {isEditing ? "Update" : "Save New"}</>}
        </button>
      </div>
    </div>
  );
}