import { db } from '@/lib/firebase';
import { ref, get, remove } from 'firebase/database';
import webpush from 'web-push';
import { NextResponse } from 'next/server';

webpush.setVapidDetails(
  'mailto:your-email@example.com', // Apna email yahan dalein
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export async function POST(req) {
  try {
    const { title, message, url } = await req.json();
    const payload = JSON.stringify({ title, message, url });

    // 1. Firebase se users fetch karein
    const usersRef = ref(db, 'notifications_users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
        return NextResponse.json({ success: true, sentTo: 0, message: "No subscribers found" });
    }

    const usersData = snapshot.val();
    let successCount = 0;

    // 2. Loop & Send
    // Firebase object (keys) ko array banakar map karein
    const promises = Object.keys(usersData).map(async (key) => {
        const user = usersData[key];
        try {
            // Subscription object 'subscription' field me hai
            await webpush.sendNotification(user.subscription, payload);
            successCount++;
        } catch (err) {
            if (err.statusCode === 410) {
                // User ne permission revoke kar di -> Database se delete karein
                await remove(ref(db, `notifications_users/${key}`));
            }
            console.error(`Failed to send to ${key}:`, err.message);
        }
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true, sentTo: successCount });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}