"use client";
import { useState, useEffect, useMemo } from "react";
import { Folder, FolderInput, Edit3, ArrowUp, ArrowDown, Save, RefreshCw, CheckCircle, MoveRight } from "lucide-react";

export default function FolderManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  
  // Selection States
  const [selectedFolder, setSelectedFolder] = useState("");
  const [targetFolder, setTargetFolder] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  
  // Logic States
  const [folderItems, setFolderItems] = useState([]);
  const [selectedItemsForMove, setSelectedItemsForMove] = useState([]);

  useEffect(() => { fetchData(); }, []);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/update-sheet");
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      }
    } catch (err) { setStatus("❌ Error Loading Data"); }
    finally { setLoading(false); }
  };

  // Derived: Unique Folders
  const uniqueFolders = useMemo(() => {
    const folders = new Set();
    items.forEach(i => i.folder && folders.add(i.folder));
    return [...folders].sort();
  }, [items]);

  // Handle Folder Selection
  useEffect(() => {
    if (selectedFolder) {
      const fItems = items
        .filter(i => i.folder === selectedFolder)
        .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      setFolderItems(fItems);
      setNewFolderName(selectedFolder); // Pre-fill for rename
    }
  }, [selectedFolder, items]);

  // 1. RENAME FOLDER Logic
  const handleRename = async () => {
    if (!newFolderName || newFolderName === selectedFolder) return;
    if (!confirm(`Rename "${selectedFolder}" to "${newFolderName}"?`)) return;

    setLoading(true);
    const updates = folderItems.map(item => ({ ...item, folder: newFolderName }));

    await saveBulkUpdates(updates, "Folder Renamed Successfully!");
    setSelectedFolder(newFolderName); // Update selection to new name
  };

  // 2. REORDER Logic
  const moveItemOrder = (index, direction) => {
    const newOrder = [...folderItems];
    if (direction === 'up' && index > 0) {
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    } else if (direction === 'down' && index < newOrder.length - 1) {
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    }
    // Update sequence locally for UI
    const sequenced = newOrder.map((item, idx) => ({ ...item, sequence: idx + 1 }));
    setFolderItems(sequenced);
  };

  const handleSaveOrder = async () => {
    await saveBulkUpdates(folderItems, "Order Saved Successfully!");
  };

  // 3. MOVE ITEMS (Create/Shift) Logic
  const handleMoveItems = async () => {
    if (selectedItemsForMove.length === 0) return alert("Select items to move first!");
    
    // Use target folder OR typed new folder name
    const destFolder = targetFolder === "NEW" ? prompt("Enter New Folder Name:") : targetFolder;
    if (!destFolder) return;

    const updates = items
      .filter(i => selectedItemsForMove.includes(i.id))
      .map(i => ({ ...i, folder: destFolder }));

    await saveBulkUpdates(updates, `Moved ${updates.length} items to "${destFolder}"`);
    setSelectedItemsForMove([]);
  };

  // Helper: Save API Call
  const saveBulkUpdates = async (updatesArray, successMsg) => {
    setLoading(true);
    try {
      const res = await fetch("/api/update-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatesArray),
      });
      const data = await res.json();
      if (data.success) {
        setStatus(`✅ ${successMsg}`);
        fetchData(); // Refresh all data
      } else {
        setStatus("❌ Update Failed");
      }
    } catch (e) { setStatus("❌ Network Error"); }
    finally { setLoading(false); }
  };

  const toggleSelectMove = (id) => {
    setSelectedItemsForMove(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-300 min-h-[500px]">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-black">
        <Folder className="text-amber-500" /> Folder Manager
      </h2>

      {/* --- SECTION 1: FOLDER SELECTION --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 p-5 rounded-xl border">
          <label className="block text-sm font-bold text-gray-500 mb-2">Select Folder to Manage</label>
          <select 
            value={selectedFolder} 
            onChange={(e) => setSelectedFolder(e.target.value)} 
            className="w-full p-3 border-2 border-amber-200 rounded-lg text-lg font-bold text-black"
          >
            <option value="">-- Choose Folder --</option>
            {uniqueFolders.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        {/* --- SECTION 2: RENAME --- */}
        {selectedFolder && (
          <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
            <label className="block text-sm font-bold text-blue-800 mb-2">Rename this Folder</label>
            <div className="flex gap-2">
              <input 
                value={newFolderName} 
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full p-3 border border-blue-300 rounded-lg text-black"
              />
              <button onClick={handleRename} disabled={loading} className="bg-blue-600 text-white px-4 rounded-lg font-bold">
                Update
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedFolder && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* --- SECTION 3: REORDER --- */}
          <div className="border-2 border-gray-100 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-700">Reorder Items</h3>
              <button onClick={handleSaveOrder} className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                <Save size={14}/> Save Order
              </button>
            </div>
            <div className="space-y-2 h-[400px] overflow-y-auto pr-2">
              {folderItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                  <div className="flex flex-col">
                    <button onClick={() => moveItemOrder(idx, 'up')} className="text-gray-400 hover:text-black"><ArrowUp size={14}/></button>
                    <button onClick={() => moveItemOrder(idx, 'down')} className="text-gray-400 hover:text-black"><ArrowDown size={14}/></button>
                  </div>
                  <span className="bg-gray-200 text-xs px-2 py-1 rounded">{idx + 1}</span>
                  <p className="text-sm font-semibold truncate flex-1 text-black">{item.title_EN || item.id}</p>
                  <input 
                    type="checkbox" 
                    checked={selectedItemsForMove.includes(item.id)}
                    onChange={() => toggleSelectMove(item.id)}
                    className="w-5 h-5 accent-amber-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* --- SECTION 4: MOVE / CREATE NEW --- */}
          <div className="border-2 border-amber-50 bg-amber-50/30 rounded-2xl p-5">
            <h3 className="font-bold text-lg text-amber-800 mb-4 flex items-center gap-2">
              <MoveRight size={20}/> Move Selected Items
            </h3>
            
            <div className="bg-white p-4 rounded-xl shadow-sm mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Selected Items: <span className="font-bold text-black">{selectedItemsForMove.length}</span>
              </p>
              
              <label className="block text-sm font-bold text-gray-700 mb-2">Move to Folder:</label>
              <select 
                value={targetFolder} 
                onChange={(e) => setTargetFolder(e.target.value)} 
                className="w-full p-3 border rounded-lg mb-4 text-black"
              >
                <option value="">-- Select Destination --</option>
                <option value="NEW" className="font-bold text-blue-600">+ Create New Folder</option>
                {uniqueFolders.filter(f => f !== selectedFolder).map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>

              <button 
                onClick={handleMoveItems}
                disabled={selectedItemsForMove.length === 0 || !targetFolder || loading}
                className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 disabled:opacity-50 transition"
              >
                {loading ? "Processing..." : "Move Items"}
              </button>
            </div>
            
            <div className="text-xs text-gray-500 p-2">
              <p>Tip: Check boxes in the list on the left to select items, then choose a destination here to move them.</p>
            </div>
          </div>

        </div>
      )}

      {/* Status Bar */}
      {status && (
        <div className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce z-50">
          <CheckCircle className="text-green-400" /> {status}
        </div>
      )}
    </div>
  );
}