import webpush from 'web-push';
import { db } from '@/lib/firebase';
import { ref, get, push, update } from 'firebase/database';
import { NextResponse } from 'next/server';

// VAPID Keys Setup
const apiKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

if (apiKeys.publicKey && apiKeys.privateKey) {
    webpush.setVapidDetails(
      'mailto:support@hitkunj.com',
      apiKeys.publicKey,
      apiKeys.privateKey
    );
}

export async function POST(req) {
  try {
    const { title, message, url, image } = await req.json();

    if (!title || !message) {
        return NextResponse.json({ success: false, error: 'Title and Message required' }, { status: 400 });
    }

    // 1. Fetch Subscribers from Firebase
    const usersRef = ref(db, 'notifications_users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
        return NextResponse.json({ success: true, message: 'No subscribers found' });
    }

    const subscribers = [];
    snapshot.forEach(child => {
        const val = child.val();
        // Check if subscription object exists
        if (val.subscription) {
            subscribers.push(val.subscription);
        }
    });

    // 2. Prepare Notification Payload
    const payload = JSON.stringify({
      title,
      body: message,
      icon: '/logo-png.png', // Default Icon
      image: image || '',
      url: url || '/',
    });

    // 3. Send to All Users
    const sendPromises = subscribers.map(sub => 
        webpush.sendNotification(sub, payload).catch(err => {
            console.error("Failed to send to one user:", err.statusCode);
            // Optional: Agar 410 Gone aaye to user ko DB se delete kar sakte hain
        })
    );

    await Promise.all(sendPromises);

    // 4. Save to History in Firebase (Optional but good for records)
    const historyRef = ref(db, 'notifications_history');
    const newHistoryRef = push(historyRef);
    await update(newHistoryRef, {
        title,
        message,
        url: url || '',
        date: new Date().toISOString(),
        sentCount: subscribers.length
    });

    return NextResponse.json({ success: true, message: `Sent to ${subscribers.length} subscribers!` });

  } catch (error) {
    console.error("Notification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}