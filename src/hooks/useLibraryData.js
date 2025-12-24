import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';

export const useLibraryData = (category) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const dataRef = ref(db, 'content_items');

    const fetchData = async () => {
        try {
            // 1. Local Storage Check (Cache duration 5 mins to reflect updates faster)
            const cachedData = localStorage.getItem('libraryData');
            const cachedTime = localStorage.getItem('libraryDataTime');
            const now = new Date().getTime();

            // Cache Logic (300000 ms = 5 minutes)
            if (cachedData && cachedTime && (now - cachedTime < 300000)) {
                const parsed = JSON.parse(cachedData);
                if (category) setData(parsed[category] || null);
                else setData(parsed);
                setLoading(false);
            }

            // 2. Fetch from Firebase
            const snapshot = await get(dataRef);
            if (snapshot.exists()) {
                const rawData = snapshot.val();
                const groupedData = {};

                Object.values(rawData).forEach(item => {
                    const cat = item.category ? item.category.trim() : 'Uncategorized';
                    if (!groupedData[cat]) {
                        groupedData[cat] = { items: [] };
                    }
                    groupedData[cat].items.push(item);
                });

                // ✅ NEW SORTING LOGIC HERE
                // Har category ke items ko sequence ke hisaab se sort karein
                Object.keys(groupedData).forEach(cat => {
                    groupedData[cat].items.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
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