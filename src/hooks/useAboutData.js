import { useState, useEffect } from 'react';
import { db } from "@/lib/firebase"; // Firebase Config Import
import { ref, onValue } from "firebase/database";

export const useAboutData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase Realtime Listener
    // Jaise hi Admin Panel me save hoga, ye automatically update ho jayega
    const contentRef = ref(db, 'about_content');

    const unsubscribe = onValue(contentRef, (snapshot) => {
      if (snapshot.exists()) {
        setData(snapshot.val());
      } else {
        console.log("No about content found in Firebase");
        setData(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Firebase About Data Error:", error);
      setLoading(false);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return { data, loading };
};