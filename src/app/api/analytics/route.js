import { db } from '@/lib/firebase';
import { ref, runTransaction, get } from 'firebase/database';
import { NextResponse } from 'next/server';

// GET: Top Views Fetch Karna
export async function GET(req) {
  try {
    const analyticsRef = ref(db, 'analytics');
    const snapshot = await get(analyticsRef);

    if(!snapshot.exists()) {
        return NextResponse.json({ success: true, data: [] });
    }

    const dataObj = snapshot.val();
    
    // Array me convert karke sort karein (High Views -> Low Views)
    const data = Object.keys(dataObj).map(key => ({
        id: key,
        ...dataObj[key]
    })).sort((a, b) => b.views - a.views); // Descending Sort

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// POST: View Count Badhana (+1)
export async function POST(req) {
    try {
      const { id, title, type } = await req.json();
      if(!id) return NextResponse.json({ error: "No ID" });
  
      const itemRef = ref(db, `analytics/${id}`);

      // Transaction: Safe way to increment counter
      await runTransaction(itemRef, (currentData) => {
        if (currentData) {
          // Agar pehle se hai, +1 karo
          return {
            ...currentData,
            views: (currentData.views || 0) + 1,
            lastUpdated: new Date().toISOString(),
            title: title || currentData.title // Title update agar change hua
          };
        } else {
          // Agar naya hai, create karo
          return {
            id: String(id),
            title: title || 'Unknown',
            type: type || 'unknown',
            views: 1,
            lastUpdated: new Date().toISOString()
          };
        }
      });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Analytics Error:", error);
      return NextResponse.json({ success: false, error: error.message });
    }
}