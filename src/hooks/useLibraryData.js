import { useState, useEffect } from 'react';

// Apna Google Script URL yahan dalein
const API_URL = "https://script.google.com/macros/s/AKfycbxVjOJt2oR_5aqAaLILycms2eGD6eqhFLLiuZxyVuRURxH-jfHvylya6lE17wGYY09C/exec";

export const useLibraryData = (category) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Local Storage check karein (Caching ke liye)
        const cachedData = localStorage.getItem('libraryData');
        const cachedTime = localStorage.getItem('libraryDataTime');
        const now = new Date().getTime();

        // 1. Agar data cache me hai aur valid hai, toh wahi use karein
        if (cachedData && cachedTime && (now - cachedTime < 3600000)) {
          const parsed = JSON.parse(cachedData);
          // Note: Cache wala data pehle se clean hoga agar humne save karte waqt clean kiya tha.
          if (category) setData(parsed[category]);
          else setData(parsed);
          setLoading(false);
          return;
        }

        // 2. Nahi to API call karein
        const response = await fetch(API_URL);
        const rawResult = await response.json();

        // --- NEW CODE: DATA CLEANING / SANITIZATION ---
        // Yahan hum data ko "clean" karenge taaki spaces ki galti automatically fix ho jaye
        const result = {};
        
        Object.keys(rawResult).forEach(key => {
            // (A) Category ke naam se space hatayein (eg: "pad-gayan " -> "pad-gayan")
            const cleanKey = key.trim();
            
            const categoryValue = rawResult[key];
            
            // (B) Items ke andar 'type', 'id' wagarah se space hatayein
            if (categoryValue && categoryValue.items && Array.isArray(categoryValue.items)) {
                categoryValue.items = categoryValue.items.map(item => ({
                    ...item,
                    // Agar type me space hai to trim karo, nahi to waise hi rehne do
                    type: item.type ? item.type.trim() : item.type, 
                    // ID ko bhi string bana ke trim kar lete hain (safety ke liye)
                    id: item.id ? String(item.id).trim() : item.id
                }));
            }
            
            // Clean key ke saath data store karein
            result[cleanKey] = categoryValue;
        });
        // ------------------------------------------------

        // 3. Clean Data ko save karein
        localStorage.setItem('libraryData', JSON.stringify(result));
        localStorage.setItem('libraryDataTime', now);

        if (category) setData(result[category]);
        else setData(result);
        
      } catch (err) {
        console.error("Data fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [category]);

  return { data, loading, error };
};