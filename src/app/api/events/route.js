import { db } from '@/lib/firebase';
import { ref, get, update, remove, push } from 'firebase/database';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const eventsRef = ref(db, 'upcoming_events');
    const snapshot = await get(eventsRef);

    if (!snapshot.exists()) {
        return NextResponse.json({ success: true, data: [] });
    }

    const data = snapshot.val();
    const events = Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    // ✅ ADDED: link destructure kiya
    const { id, title, startDate, endDate, description, image, type, link } = body;

    if (!title || !startDate) {
        return NextResponse.json({ success: false, message: "Title and Start Date are required" }, { status: 400 });
    }

    const eventsRef = ref(db, 'upcoming_events');
    const eventId = id || push(eventsRef).key;

    const dataToSave = {
      id: eventId,
      title,
      startDate,
      endDate: endDate || startDate,
      description: description || "",
      image: image || '/logo-png.png',
      link: link || "", // ✅ Saving Link
      type: type || 'upcoming',
      updatedAt: new Date().toISOString()
    };

    await update(ref(db, `upcoming_events/${eventId}`), dataToSave);

    return NextResponse.json({ success: true, message: '🎉 Event Saved Successfully!' });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
    try {
        const { id } = await req.json();
        if (!id) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });

        await remove(ref(db, `upcoming_events/${id}`));
        return NextResponse.json({ success: true, message: '🗑️ Event Deleted!' });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}