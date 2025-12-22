import { db } from '@/lib/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { recommendation } = await req.json();

    if (!recommendation) {
        return NextResponse.json({ success: false, error: "Empty" }, { status: 400 });
    }
    
    // Feedback ko 'feedback_box' node me save karein
    await push(ref(db, 'feedback_box'), {
      text: recommendation,
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      timestamp: serverTimestamp()
    });

    return NextResponse.json({ success: true, message: 'Feedback Saved' });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}