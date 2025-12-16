import { useState, useEffect } from 'react';

// Yahan wo NAYA URL paste karein jo abhi mila hai
const ABOUT_API_URL = "https://script.google.com/macros/s/AKfycbz9fsjPsA60-xIt7Ytwpj1XcMqsN3ASrTCHJrxqQ1BgPrNubUOwt7UEjq5D93-ng2Q7/exec";

export const useAboutData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Caching Logic (Taaki bar-bar load na ho)
        const cachedData = localStorage.getItem('aboutData');
        const cachedTime = localStorage.getItem('aboutDataTime');
        const now = new Date().getTime();
        // 
        // 10 Minute Cache (600000 ms)
        if (cachedData && cachedTime && (now - cachedTime < 36)) {
          setData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Fetch from New Script
        const response = await fetch(ABOUT_API_URL);
        const result = await response.json();

        // Save to Local Storage
        localStorage.setItem('aboutData', JSON.stringify(result));
        localStorage.setItem('aboutDataTime', now);

        setData(result);
        
      } catch (err) {
        console.error("About data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading };
};