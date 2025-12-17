import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

// Common Auth Function
async function getDoc() {
  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  return doc;
}

// ------------------------------------------------------------------
// 1. SAVE / UPDATE (POST)
// ------------------------------------------------------------------
export async function POST(req) {
  try {
    const body = await req.json();
    
    // ✅ 'folder' add kiya
    const { 
      rowId, category, folder,folder_HI, image, type, audioUrl,
      title_HI, title_EN, title_HING,
      desc_HI, desc_EN, desc_HING,
      content_HI, content_EN, content_HING 
    } = body;

    const doc = await getDoc();
    const sheet = doc.sheetsById[969554279]; // Items Sheet ID
    const rows = await sheet.getRows();

    // Row Dhundo
    const existingRow = rows.find((r) => r.get('id') === rowId);

    if (existingRow) {
      // --- UPDATE EXISTING ---
      if(category) existingRow.set('category', category);
      if(folder) existingRow.set('folder', folder); // ✅ Update Folder
      // route.js me ye line add karein existingRow.set aur addRow me:
      if(folder_HI) existingRow.set('folder_HI', folder_HI); // Column header match hona chahiye
      if(image) existingRow.set('image', image);
      if(type) existingRow.set('type', type);
      if(audioUrl) existingRow.set('audioUrl', audioUrl);
      
      if(title_HI) existingRow.set('title_HI', title_HI);
      if(title_EN) existingRow.set('title_EN', title_EN);
      if(title_HING) existingRow.set('title_HING', title_HING);

      if(desc_HI) existingRow.set('desc_HI', desc_HI);
      if(desc_EN) existingRow.set('desc_EN', desc_EN);
      if(desc_HING) existingRow.set('desc_HING', desc_HING);

      if(content_HI) existingRow.set('content_HI', content_HI);
      if(content_EN) existingRow.set('content_EN', content_EN);
      if(content_HING) existingRow.set('content_HING', content_HING);

      await existingRow.save();
      return NextResponse.json({ success: true, message: '✅ Updated Successfully!' });

    } else {
      // --- CREATE NEW ---
      await sheet.addRow({
        id: rowId,
        category,
        folder, // ✅ New Folder Column
        folder_HI, // ✅ New Folder Column
        type,
        image,
        audioUrl,
        title_HI, title_EN, title_HING,
        desc_HI, desc_EN, desc_HING,
        content_HI, content_EN, content_HING
      });

      return NextResponse.json({ success: true, message: '🎉 Created Successfully!' });
    }

  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ------------------------------------------------------------------
// 2. DELETE (DELETE)
// ------------------------------------------------------------------
export async function DELETE(req) {
    try {
        const { rowId } = await req.json();
        
        const doc = await getDoc();
        const sheet = doc.sheetsById[969554279]; 
        const rows = await sheet.getRows();

        const existingRow = rows.find((r) => r.get('id') === rowId);

        if (!existingRow) {
            return NextResponse.json({ success: false, message: '❌ ID Not Found' }, { status: 404 });
        }

        await existingRow.delete(); // 🗑️ Delete row
        
        return NextResponse.json({ success: true, message: '🗑️ Item Deleted Successfully!' });

    } catch (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}