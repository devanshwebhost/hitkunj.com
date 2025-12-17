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
        // Local Storage check karein (Caching ke liye) taaki baar baar slow API call na ho
        const cachedData = localStorage.getItem('libraryData');
        const cachedTime = localStorage.getItem('libraryDataTime');
        const now = new Date().getTime();

        // Agar data 1 ghante (3600000 ms) se purana nahi hai, to cache use karo
        if (cachedData && cachedTime && (now - cachedTime < 3600000)) {
          const parsed = JSON.parse(cachedData);
          if (category) setData(parsed[category]);
          else setData(parsed);
          setLoading(false);
          return;
        }

        // Nahi to API call karo
        const response = await fetch(API_URL);
        const result = await response.json();

        // Data save karo
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