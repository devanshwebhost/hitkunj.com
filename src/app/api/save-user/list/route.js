import { db } from '@/lib/firebase';
import { ref, get } from 'firebase/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const usersRef = ref(db, 'notifications_users');
    const snapshot = await get(usersRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ success: true, users: [] });
    }

    const data = snapshot.val();
    
    // Firebase object (Keys) ko Array mein convert karein
    const users = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));

    return NextResponse.json({ success: true, users });

  } catch (error) {
    console.error("List Users API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}