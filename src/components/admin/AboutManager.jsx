"use client";
import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase";
import { ref, get, update } from "firebase/database";
import { Save, RefreshCw, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';

// ✅ INITIAL DATA (Data Loss se bachne ke liye + HING support)
const INITIAL_DATA = {
  heroTag: { HI: "", EN: "", HING: "" },
  heroTitle: { HI: "", EN: "", HING: "" },
  heroDesc: { HI: "", EN: "", HING: "", image: "" },
  imgCaption: { HI: "", EN: "", HING: "", image: "" },
  introTitle: { HI: "", EN: "", HING: "" },
  introP1: { HI: "", EN: "", HING: "" },
  introP2: { HI: "", EN: "", HING: "" },
  sectionTitle: { HI: "", EN: "", HING: "" },
  featuredItems: [], // Cards hat gaye, ab ye list use hogi
  footerQuote: { HI: "", EN: "", HING: "" }
};

export default function AboutManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState(INITIAL_DATA);
  
  // Folder Selection States
  const [availableFolders, setAvailableFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");

  // 1. Fetch Data on Load
  useEffect(() => {
    loadData();
    fetchFolders(); 
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const snapshot = await get(ref(db, 'about_content'));
      if (snapshot.exists()) {
        const dbVal = snapshot.val();
        // ✅ MERGE FIX: Database value ko Initial ke sath merge kiya
        setData({
             ...INITIAL_DATA,
             ...dbVal,
             featuredItems: dbVal.featuredItems || [] 
        });
      } else {
        setData(INITIAL_DATA);
      }
    } catch (error) {
      console.error("Error loading about data:", error);
    }
    setLoading(false);
  };

  const fetchFolders = async () => {
    try {
      const snapshot = await get(ref(db, 'content_items'));
      if (snapshot.exists()) {
        const items = Object.values(snapshot.val());
        const uniqueFolders = {};
        items.forEach(item => {
            if(item.folder && !uniqueFolders[item.folder]) {
                uniqueFolders[item.folder] = {
                    id: item.folder, 
                    name_EN: item.folder,
                    name_HI: item.folder_HI || item.folder,
                    image: item.image || "/logo-png.png"
                };
            }
        });
        setAvailableFolders(Object.values(uniqueFolders));
      }
    } catch (err) {
      console.error("Error loading folders", err);
    }
  };

  // 2. Handle Save
  const handleSave = async () => {
    setSaving(true);
    try {
      await update(ref(db, 'about_content'), data);
      alert("✅ About Page Updated Successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save changes.");
    }
    setSaving(false);
  };

  const handleChange = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // --- FEATURED ITEMS LOGIC ---
  const addFeaturedItem = () => {
     if(!selectedFolderId) return;
     const folder = availableFolders.find(f => f.id === selectedFolderId);
     if(!folder) return;

     const newItem = {
         id: Date.now(),
         folderName: folder.name_EN,
         title_EN: folder.name_EN,
         title_HI: folder.name_HI,
         title_HING: folder.name_EN, // Default HING same as EN
         desc_EN: "Click to explore",
         desc_HI: "देखने के लिए क्लिक करें",
         desc_HING: "Dekhne ke liye click karein",
         image: folder.image,
         link: `/lab/${slugify(folder.name_EN)}`
     };

     setData(prev => ({
         ...prev,
         featuredItems: [...(prev.featuredItems || []), newItem]
     }));
     setSelectedFolderId(""); 
  };

  const removeFeaturedItem = (index) => {
      const updated = [...data.featuredItems];
      updated.splice(index, 1);
      setData(prev => ({ ...prev, featuredItems: updated }));
  };

  const updateFeaturedItem = (index, field, val) => {
      const updated = [...data.featuredItems];
      updated[index][field] = val;
      setData(prev => ({ ...prev, featuredItems: updated }));
  };

  const slugify = (text) => text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-') || "";


  if (loading) return <div className="p-10 text-center">Loading Data...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50 z-20 py-4 border-b">
        <h2 className="text-3xl font-bold text-black">Manage About Page</h2>
        <div className="flex gap-2">
            <button onClick={loadData} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"><RefreshCw size={20} className='text-black'/></button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-full font-bold hover:bg-gray-800 disabled:opacity-50">
                <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
            </button>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* --- HERO SECTION --- */}
        <SectionCard title="1. Hero Section (Top Banner)">
            <InputGroup label="Tagline (Small Text)" section="heroTag" data={data} onChange={handleChange} />
            <InputGroup label="Main Title" section="heroTitle" data={data} onChange={handleChange} />
            <InputGroup label="Description" section="heroDesc" data={data} onChange={handleChange} textarea />
            <ImageInput label="Background Image URL" section="heroDesc" value={data.heroDesc?.image} onChange={handleChange} />
        </SectionCard>

        {/* --- INTRO SECTION --- */}
        <SectionCard title="2. Introduction (Photo & Text)">
            <ImageInput label="Side Image URL" section="imgCaption" value={data.imgCaption?.image} onChange={handleChange} />
            <InputGroup label="Image Caption" section="imgCaption" data={data} onChange={handleChange} />
            <div className='border-t pt-4 mt-4'></div>
            <InputGroup label="Intro Title" section="introTitle" data={data} onChange={handleChange} />
            <InputGroup label="Paragraph 1" section="introP1" data={data} onChange={handleChange} textarea />
            <InputGroup label="Paragraph 2" section="introP2" data={data} onChange={handleChange} textarea />
        </SectionCard>

        {/* --- 3. FEATURED SECTIONS (UPDATED) --- */}
        <SectionCard title="3. Featured Collections (Select Folders)">
            <InputGroup label="Section Title" section="sectionTitle" data={data} onChange={handleChange} />
            
            {/* Folder Selector */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <label className="block text-xs font-bold text-blue-800 uppercase mb-2">Add a Folder to List</label>
                <div className="flex gap-2">
                    <select 
                        className="flex-1 p-2 rounded border border-blue-200 text-black"
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                    >
                        <option value="">-- Select Folder --</option>
                        {availableFolders.map(f => (
                            <option key={f.id} value={f.id}>{f.name_EN} ({f.name_HI})</option>
                        ))}
                    </select>
                    <button onClick={addFeaturedItem} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 flex items-center gap-1">
                        <Plus size={16}/> Add
                    </button>
                </div>
            </div>

            {/* List of Added Items with 3 Language Inputs */}
            <div className="space-y-4">
                {data.featuredItems && data.featuredItems.map((item, index) => (
                    <div key={index} className="bg-gray-50 border p-4 rounded-xl flex gap-4 items-start relative group">
                         <img src={item.image} alt="preview" className="w-20 h-20 rounded object-cover bg-gray-200" />
                         <div className="flex-1 grid gap-3">
                             {/* TITLES */}
                             <div>
                                 <label className="text-[10px] uppercase font-bold text-gray-400">Titles</label>
                                 <div className="grid grid-cols-3 gap-2">
                                    <input type="text" value={item.title_HI} onChange={(e) => updateFeaturedItem(index, 'title_HI', e.target.value)} className="text-sm p-2 border rounded text-black" placeholder="Hindi Title" />
                                    <input type="text" value={item.title_EN} onChange={(e) => updateFeaturedItem(index, 'title_EN', e.target.value)} className="text-sm p-2 border rounded text-black" placeholder="English Title" />
                                    <input type="text" value={item.title_HING} onChange={(e) => updateFeaturedItem(index, 'title_HING', e.target.value)} className="text-sm p-2 border rounded text-black bg-yellow-50" placeholder="Hinglish Title" />
                                 </div>
                             </div>
                             {/* DESCRIPTIONS */}
                             <div>
                                 <label className="text-[10px] uppercase font-bold text-gray-400">Descriptions</label>
                                 <div className="grid grid-cols-3 gap-2">
                                    <input type="text" value={item.desc_HI} onChange={(e) => updateFeaturedItem(index, 'desc_HI', e.target.value)} className="text-xs p-2 border rounded text-gray-700" placeholder="Hindi Desc" />
                                    <input type="text" value={item.desc_EN} onChange={(e) => updateFeaturedItem(index, 'desc_EN', e.target.value)} className="text-xs p-2 border rounded text-gray-700" placeholder="English Desc" />
                                    <input type="text" value={item.desc_HING} onChange={(e) => updateFeaturedItem(index, 'desc_HING', e.target.value)} className="text-xs p-2 border rounded text-gray-700 bg-yellow-50" placeholder="Hinglish Desc" />
                                 </div>
                             </div>
                         </div>
                         <button onClick={() => removeFeaturedItem(index)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button>
                    </div>
                ))}
                {(!data.featuredItems || data.featuredItems.length === 0) && (
                    <p className="text-center text-gray-400 text-sm">No featured items added yet.</p>
                )}
            </div>
        </SectionCard>

        {/* --- FOOTER QUOTE --- */}
        <SectionCard title="4. Footer Quote">
            <InputGroup label="Bottom Quote" section="footerQuote" data={data} onChange={handleChange} textarea />
        </SectionCard>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS (Now with 3 columns for HING) ---
function SectionCard({ title, children }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-black mb-4 border-b pb-2">{title}</h3>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function InputGroup({ label, section, data, onChange, textarea }) {
    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
            <div className="grid grid-cols-3 gap-4"> 
                {/* 3 Columns for HI, EN, HING */}
                {textarea ? (
                    <>
                        <textarea placeholder="Hindi" value={data[section]?.HI || ""} onChange={(e) => onChange(section, "HI", e.target.value)} className="w-full p-2 border rounded-lg text-black bg-gray-50 h-24 text-sm" />
                        <textarea placeholder="English" value={data[section]?.EN || ""} onChange={(e) => onChange(section, "EN", e.target.value)} className="w-full p-2 border rounded-lg text-black bg-gray-50 h-24 text-sm" />
                        <textarea placeholder="Hinglish" value={data[section]?.HING || ""} onChange={(e) => onChange(section, "HING", e.target.value)} className="w-full p-2 border rounded-lg text-black bg-yellow-50 h-24 text-sm" />
                    </>
                ) : (
                    <>
                        <input type="text" placeholder="Hindi" value={data[section]?.HI || ""} onChange={(e) => onChange(section, "HI", e.target.value)} className="w-full p-2 border rounded-lg text-black bg-gray-50 text-sm" />
                        <input type="text" placeholder="English" value={data[section]?.EN || ""} onChange={(e) => onChange(section, "EN", e.target.value)} className="w-full p-2 border rounded-lg text-black bg-gray-50 text-sm" />
                        <input type="text" placeholder="Hinglish" value={data[section]?.HING || ""} onChange={(e) => onChange(section, "HING", e.target.value)} className="w-full p-2 border rounded-lg text-black bg-yellow-50 text-sm" />
                    </>
                )}
            </div>
        </div>
    );
}

function ImageInput({ label, section, value, onChange }) {
    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-blue-600 uppercase mb-1 flex items-center gap-1"><ImageIcon size={14}/> {label}</label>
            <input 
                type="text" 
                placeholder="Paste Image URL here..." 
                value={value || ""} 
                onChange={(e) => onChange(section, "image", e.target.value)} 
                className="w-full p-2 border-2 border-dashed border-blue-200 rounded-lg text-black bg-blue-50 text-sm font-mono" 
            />
        </div>
    );
}