import { db } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { title, message, url } = await req.json();
    
    // Direct 'notifications_history' node me naya data push karein
    await push(ref(db, 'notifications_history'), {
      title,
      message,
      url: url || '',
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      timestamp: serverTimestamp() // Sorting ke liye best hai
    });

    return NextResponse.json({ success: true, message: 'Notification Saved to History' });

  } catch (error) {
    console.error("Save Notification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}