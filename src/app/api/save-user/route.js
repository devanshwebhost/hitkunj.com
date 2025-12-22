import { db } from '@/lib/firebase';
import { ref, get, push, query, orderByChild, equalTo, serverTimestamp } from 'firebase/database';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { subscription, name } = await req.json();
    
    // Subscription object ko string banayein (taaki duplicate check kar sakein)
    const subString = JSON.stringify(subscription);
    
    // Duplicate Check: Kya ye subscription pehle se hai?
    const usersRef = ref(db, 'notifications_users');
    const q = query(usersRef, orderByChild('subscriptionString'), equalTo(subString));
    
    const snapshot = await get(q);

    if (snapshot.exists()) {
      return NextResponse.json({ success: true, message: '✅ Already Subscribed' });
    }

    // Save New User
    await push(usersRef, {
      subscription: subscription, // Asli JSON object save karein
      subscriptionString: subString, // Searching ke liye string version
      name: name || 'Anonymous',
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      timestamp: serverTimestamp()
    });

    return NextResponse.json({ success: true, message: '🎉 Subscribed Successfully' });

  } catch (error) {
    console.error("Save API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}