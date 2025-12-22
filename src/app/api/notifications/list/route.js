import { db } from '@/lib/firebase';
import { ref, get, query, limitToLast, orderByKey } from 'firebase/database';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Last 50 notifications layein (optimisation ke liye)
    const historyRef = query(ref(db, 'notifications_history'), orderByKey(), limitToLast(50));
    const snapshot = await get(historyRef);
    
    if (!snapshot.exists()) return NextResponse.json({ success: true, notifications: [] });

    const data = snapshot.val();

    // Object ko Array banayein aur Reverse karein (Newest First)
    const notifications = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    })).reverse();

    return NextResponse.json({ success: true, notifications });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}