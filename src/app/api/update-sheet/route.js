import { db } from '@/lib/firebase';
import { ref, update, remove, get } from 'firebase/database';
import { NextResponse } from 'next/server';

// GET: Fetch All Content (For Admin Panel)
export async function GET() {
  try {
    const contentRef = ref(db, 'content_items');
    const snapshot = await get(contentRef);
    
    if (!snapshot.exists()) {
      return NextResponse.json({ success: true, data: [] });
    }

    const rawData = snapshot.val();
    // Object ko Array banayein
    const data = Object.values(rawData);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Save / Update
export async function POST(req) {
  try {
    const body = await req.json();
    const { rowId, ...rest } = body; // rowId nikal kar baaki data lein

    if (!rowId) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });

    const itemRef = ref(db, `content_items/${rowId}`);
    
    // Data clean karein (undefined remove karein)
    const dataToSave = { id: rowId, ...rest, updatedAt: new Date().toISOString() };
    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

    await update(itemRef, dataToSave);

    return NextResponse.json({ success: true, message: '✅ Saved Successfully!' });

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE: Remove Item
export async function DELETE(req) {
    try {
        const { rowId } = await req.json();
        if (!rowId) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });

        await remove(ref(db, `content_items/${rowId}`));
        return NextResponse.json({ success: true, message: '🗑️ Deleted Successfully!' });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}