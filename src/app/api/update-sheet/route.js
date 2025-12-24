import { db } from '@/lib/firebase';
import { ref, update, remove, get } from 'firebase/database';
import { NextResponse } from 'next/server';

// GET: Fetch All Content (Sorted by Sequence)
export async function GET() {
  try {
    const contentRef = ref(db, 'content_items');
    const snapshot = await get(contentRef);
    if (!snapshot.exists()) return NextResponse.json({ success: true, data: [] });

    const rawData = snapshot.val();
    // Data ko array banayein aur sequence ke hisaab se sort karein
    const data = Object.values(rawData).sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Save Single Item OR Bulk Items
export async function POST(req) {
  try {
    const body = await req.json();

    // Check agar body ek Array hai (Bulk Update ke liye)
    if (Array.isArray(body)) {
      const updates = {};
      body.forEach(item => {
        if (item.id) {
            const cleanItem = { ...item, updatedAt: new Date().toISOString() };
            // Undefined values hata kar clean data banayein
            Object.keys(cleanItem).forEach(key => cleanItem[key] === undefined && delete cleanItem[key]);
            updates[`content_items/${item.id}`] = cleanItem;
        }
      });
      
      // Ek saath update karein
      if (Object.keys(updates).length > 0) {
        await update(ref(db), updates);
      }
      return NextResponse.json({ success: true, message: '✅ Bulk Update Successful!' });
    } 
    
    // Single Item Save (Old Logic)
    else {
      const { rowId, ...rest } = body;
      if (!rowId) return NextResponse.json({ success: false, message: 'Missing ID' }, { status: 400 });

      const itemRef = ref(db, `content_items/${rowId}`);
      const dataToSave = { id: rowId, ...rest, updatedAt: new Date().toISOString() };
      Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

      await update(itemRef, dataToSave);
      return NextResponse.json({ success: true, message: '✅ Saved Successfully!' });
    }

  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE logic same as before...
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