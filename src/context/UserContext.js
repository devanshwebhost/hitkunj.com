"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Default Initial State
  const defaultState = {
    name: '',
    naamJap: {
      count: 0,
      dailyGoal: 108,
      longTermGoal: 100000,
      longTermDays: 30,
      startDate: Date.now(),
      history: {}
    },
    nityaNiyam: [], // New Field (Empty Array by default)
    readingProgress: {},
    customFolders: [] // Legacy field (agar purana ho to)
  };

  const [userData, setUserData] = useState(defaultState);

  // 1. Load Data with Safety Merge
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem('hitkunj_user_data');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // CRITICAL FIX: Merge saved data with defaultState to ensure new fields exist
          setUserData({
            ...defaultState, // Pehle defaults rakho
            ...parsed,       // Fir saved data overwrite karega
            nityaNiyam: parsed.nityaNiyam || [], // Agar saved me nityaNiyam nahi hai to [] use karo
            naamJap: { ...defaultState.naamJap, ...parsed.naamJap } // Deep merge for nested objects if needed
          });
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // 2. Save Data
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('hitkunj_user_data', JSON.stringify(userData));
    }
  }, [userData, isLoaded]);

  // --- Functions ---

  const addToRoutine = (item) => {
    setUserData(prev => {
       // Safety Check: Ensure nityaNiyam exists
       const currentList = prev.nityaNiyam || []; 
       const exists = currentList.find(i => i.id === item.id);
       
       if(exists) return prev; 
       
       return { 
         ...prev, 
         nityaNiyam: [...currentList, item] 
       };
    });
  };

  const removeFromRoutine = (id) => {
    setUserData(prev => ({
       ...prev,
       nityaNiyam: (prev.nityaNiyam || []).filter(item => item.id !== id)
    }));
  };

  const updateReadingProgress = (id, progressData) => {
    const today = new Date().toDateString();
    setUserData(prev => ({
       ...prev,
       readingProgress: {
          ...prev.readingProgress,
          [id]: { ...progressData, lastDate: today }
       }
    }));
  };

  const getProgress = (id) => {
     // Safety check
     if (!userData.readingProgress) return { lastIndex: -1, dailyCount: 0, lastDate: new Date().toDateString() };
     return userData.readingProgress[id] || { lastIndex: -1, dailyCount: 0, lastDate: new Date().toDateString() };
  };

  const incrementJap = () => {
    const today = new Date().toDateString();
    setUserData(prev => ({
      ...prev,
      naamJap: {
        ...prev.naamJap,
        count: (prev.naamJap.count || 0) + 1,
        history: {
          ...(prev.naamJap.history || {}),
          [today]: ((prev.naamJap.history && prev.naamJap.history[today]) || 0) + 1
        }
      }
    }));
  };

  return (
    <UserContext.Provider value={{ userData, setUserData, addToRoutine, removeFromRoutine, updateReadingProgress, getProgress, incrementJap }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);