"use client";
import { useState, useEffect } from "react";
import { Calendar, Save, Trash2, Edit, Plus, XCircle, RefreshCw, Image as ImageIcon, Link as LinkIcon } from "lucide-react";

export default function EventManager() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // ✅ UPDATED: Added 'link' field
  const initialForm = { id: "", title: "", startDate: "", endDate: "", description: "", image: "", link: "" };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if(data.success) setEvents(data.data);
    } catch (error) {
        alert("Failed to fetch events");
    } finally {
        setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if(!formData.title || !formData.startDate) return alert("Title and Start Date are required!");
    
    setLoading(true);
    try {
        const payload = {
            ...formData,
            endDate: formData.endDate || formData.startDate 
        };

        const res = await fetch("/api/events", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if(data.success) {
            alert(data.message);
            handleCancel();
            fetchEvents();
        }
    } catch (error) {
        alert("Error saving event");
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Are you sure you want to delete this event?")) return;
    try {
        const res = await fetch("/api/events", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        });
        if(res.ok) fetchEvents();
    } catch (error) { console.error(error); }
  };

  const handleEdit = (event) => {
      setFormData({
          id: event.id,
          title: event.title,
          description: event.description,
          image: event.image,
          link: event.link || "", // ✅ Load existing link
          startDate: event.startDate || event.date,
          endDate: event.endDate || event.startDate || event.date
      });
      setIsEditing(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
      setFormData(initialForm);
      setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-gray-300">
      
      <div className="flex justify-between items-center mb-8 border-b pb-4">
          <h2 className="text-3xl font-extrabold text-black flex items-center gap-2">
            <Calendar className="text-amber-600" /> Utsav Manager
          </h2>
          <button onClick={fetchEvents} className="p-2 hover:bg-gray-100 rounded-full">
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
      </div>

      {/* --- FORM SECTION --- */}
      <div className="bg-gray-50 p-6 rounded-2xl mb-10 border border-gray-200">
          <h3 className="font-bold text-lg mb-4 text-black flex items-center gap-2">
              {isEditing ? <Edit size={18}/> : <Plus size={18}/>} 
              {isEditing ? "Edit Event" : "Add New Utsav"}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input 
                  name="title" value={formData.title} onChange={handleChange} 
                  placeholder="Event Name (e.g. Radhashtami)" 
                  className="p-3 rounded-lg border border-gray-300 outline-none focus:border-amber-500 text-black"
              />
              
              {/* DATE PICKERS */}
              <div className="flex gap-2">
                  <div className="w-full">
                    <label className="text-xs font-bold text-gray-500 ml-1">Start Date</label>
                    <input 
                        type="date" 
                        name="startDate" value={formData.startDate} onChange={handleChange} 
                        className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-amber-500 text-black"
                    />
                  </div>
                  <div className="w-full">
                    <label className="text-xs font-bold text-gray-500 ml-1">End Date (Optional)</label>
                    <input 
                        type="date" 
                        name="endDate" value={formData.endDate} onChange={handleChange} 
                        className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-amber-500 text-black"
                    />
                  </div>
              </div>

              <div className="relative">
                  <ImageIcon size={16} className="absolute left-3 top-4 text-gray-400"/>
                  <input 
                    name="image" value={formData.image} onChange={handleChange} 
                    placeholder="Image URL (Optional)" 
                    className="pl-10 w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-amber-500 text-black"
                  />
              </div>

              {/* ✅ NEW: LINK FIELD */}
              <div className="relative">
                  <LinkIcon size={16} className="absolute left-3 top-4 text-gray-400"/>
                  <input 
                    name="link" value={formData.link} onChange={handleChange} 
                    placeholder="Video/More Info Link (Optional)" 
                    className="pl-10 w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-amber-500 text-black"
                  />
              </div>
          </div>
          <textarea 
               name="description" value={formData.description} onChange={handleChange} 
               placeholder="Description..." rows={3}
               className="w-full p-3 rounded-lg border border-gray-300 outline-none focus:border-amber-500 text-black mb-4"
          />

          <div className="flex gap-3">
              <button onClick={handleSubmit} disabled={loading} className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2">
                  <Save size={18} /> {isEditing ? "Update" : "Save Event"}
              </button>
              {isEditing && (
                  <button onClick={handleCancel} className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition flex items-center gap-2">
                      <XCircle size={18} /> Cancel
                  </button>
              )}
          </div>
      </div>

      {/* --- LIST SECTION --- */}
      <div className="space-y-4">
          {events.map(event => (
              <div key={event.id} className="flex flex-col md:flex-row items-center gap-4 p-4 border border-gray-200 rounded-xl bg-white">
                  <div className="flex-1 text-center md:text-left">
                      <h4 className="font-bold text-lg text-black">{event.title}</h4>
                      <p className="text-sm text-amber-600 font-bold">
                          {event.startDate}
                      </p>
                      {event.link && <a href={event.link} target="_blank" className="text-xs text-blue-500 underline truncate block max-w-xs">{event.link}</a>}
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => handleEdit(event)} className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><Edit size={18} /></button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={18} /></button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}