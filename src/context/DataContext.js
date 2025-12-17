"use client";
import { createContext, useContext, useEffect, useState } from 'react';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // आपकी Google App Script का URL (इसे अपनी वाली से बदलें)
  const API_URL = "https://script.google.com/macros/s/AKfycbz9fsjPsA60-xIt7Ytwpj1XcMqsN3ASrTCHJrxqQ1BgPrNubUOwt7UEjq5D93-ng2Q7/exec"; 

  useEffect(() => {
    const loadData = async () => {
      // 1. पहले LocalStorage चेक करें (ताकि यूजर को वेट न करना पड़े)
      const cachedData = localStorage.getItem('site_data_cache');
      if (cachedData) {
        setData(JSON.parse(cachedData));
        setLoading(false);
      }

      // 2. बैकग्राउंड में नया डेटा लायें
      try {
        const response = await fetch(API_URL);
        const newData = await response.json();
        
        // डेटा सेव करें
        setData(newData);
        localStorage.setItem('site_data_cache', JSON.stringify(newData));
        setLoading(false);
      } catch (error) {
        console.error("Data fetch error:", error);
      }
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);