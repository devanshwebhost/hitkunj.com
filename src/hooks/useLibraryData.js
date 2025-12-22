import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // Direct Firebase connection
import { ref, onValue, get } from 'firebase/database';

export const useLibraryData = (category) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Hum 'content_items' node se data layenge
    // Note: Agar data bahut bada hai to hum API route use karte, 
    // lekin text data ke liye direct connection fastest hai.
    
    const dataRef = ref(db, 'content_items');

    const fetchData = async () => {
        try {
            // 1. Local Storage Check (Optional Speedup)
            const cachedData = localStorage.getItem('libraryData');
            const cachedTime = localStorage.getItem('libraryDataTime');
            const now = new Date().getTime();

            // Cache Logic (1 hour)
            if (cachedData && cachedTime && (now - cachedTime < 3600000)) {
                const parsed = JSON.parse(cachedData);
                if (category) setData(parsed[category] || null);
                else setData(parsed);
                setLoading(false);
                
                // Background me fresh data fetch karein (SWR strategy)
                // Agar aap chahte hain ki cache hi use ho to niche wala part hata sakte hain
            }

            // 2. Fetch from Firebase
            const snapshot = await get(dataRef);
            if (snapshot.exists()) {
                const rawData = snapshot.val();
                
                // Firebase Data 'ID' wise stored hai object me.
                // Hame isse 'Category' wise group karna padega jaisa aapka frontend expect karta hai.
                
                const groupedData = {};

                Object.values(rawData).forEach(item => {
                    const cat = item.category ? item.category.trim() : 'Uncategorized';
                    
                    if (!groupedData[cat]) {
                        groupedData[cat] = { items: [] };
                    }
                    
                    groupedData[cat].items.push(item);
                });

                // Save to LocalStorage
                localStorage.setItem('libraryData', JSON.stringify(groupedData));
                localStorage.setItem('libraryDataTime', now);

                if (category) setData(groupedData[category] || null);
                else setData(groupedData);
            }
        } catch (err) {
            console.error("Firebase fetch error:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    fetchData();

  }, [category]);

  return { data, loading, error };
};