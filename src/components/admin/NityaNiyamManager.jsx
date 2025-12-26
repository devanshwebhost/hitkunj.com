"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, get, update } from 'firebase/database';
import { useLibraryData } from '@/hooks/useLibraryData';
import { Save, BookOpen, CheckCircle, RefreshCw } from 'lucide-react';

export default function NityaNiyamManager() {
  const { data: libraryData, loading: libLoading } = useLibraryData();
  const [defaults, setDefaults] = useState({}); 
  const [saving, setSaving] = useState(null);
  
  useEffect(() => {
    get(ref(db, 'folder_metadata')).then(snap => {
       if (snap.exists()) setDefaults(snap.val());
    });
  }, []);

  const handleUpdate = async (folderKey, newValue) => {
    if (!newValue || newValue < 1) return alert("Invalid Number");
    setSaving(folderKey);
    await update(ref(db), { [`folder_metadata/${folderKey}/defaultLimit`]: Number(newValue) });
    setDefaults(prev => ({ ...prev, [folderKey]: { defaultLimit: Number(newValue) } }));
    setSaving(null);
  };

  if (libLoading) return <div className="p-10 text-center">Loading...</div>;

  const folders = libraryData ? Object.keys(libraryData).sort() : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="border-b pb-4 mb-4">
         <h2 className="text-xl font-bold flex items-center gap-2 text-black">
           <BookOpen size={20}/> Nitya Niyam Defaults
         </h2>
         <p className="text-gray-500 text-sm">Set default daily limits. Users can override this.</p>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
            <th className="p-3">Folder Name</th>
            <th className="p-3">Total Pads</th>
            <th className="p-3">Default Daily Limit</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {folders.map((key) => (
             <AdminRow 
               key={key} 
               folderKey={key} 
               total={libraryData[key].items?.length || 0}
               defaultVal={defaults[key]?.defaultLimit}
               onSave={handleUpdate}
               isSaving={saving === key}
             />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminRow({ folderKey, total, defaultVal, onSave, isSaving }) {
   const [val, setVal] = useState(defaultVal || 11);
   return (
      <tr className="hover:bg-gray-50">
         <td className="p-3 font-medium capitalize">{folderKey.replace(/-/g, ' ')}</td>
         <td className="p-3 text-gray-500">{total}</td>
         <td className="p-3">
            <input 
               type="number" 
               className="border rounded px-2 py-1 w-20 text-center font-bold"
               value={val}
               onChange={(e) => setVal(e.target.value)}
            />
         </td>
         <td className="p-3">
            <button 
               onClick={() => onSave(folderKey, val)}
               disabled={isSaving}
               className="bg-black text-white px-3 py-1 rounded text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
            >
               {isSaving ? 'Saving...' : 'Set'}
            </button>
         </td>
      </tr>
   );
}