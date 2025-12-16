import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    
    // Data destructure kar rahe hain
    const { 
      rowId, category, image, type, audioUrl,
      title_HI, title_EN, title_HING,
      desc_HI, desc_EN, desc_HING,
      content_HI, content_EN, content_HING 
    } = body;

    // 1. Auth Setup
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // 2. Load Specific Sheet (Tab)
    // Make sure ye GID sahi ho. Agar shak ho to doc.sheetsByIndex[0] use karein
    const sheet = doc.sheetsById[969554279]; 
    const rows = await sheet.getRows();

    // 3. Row Dhundhein (Smart Logic)
    // Note: Sheet ki Header row me 'id' likha hona chahiye (case sensitive)
    const existingRow = rows.find((r) => r.get('id') === rowId);

    if (existingRow) {
      // -------------------------------------------------------
      // CASE A: UPDATE (Agar Row Mil Gayi)
      // -------------------------------------------------------
      if(category) existingRow.set('category', category);
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

      await existingRow.save(); // Save changes
      
      return NextResponse.json({ 
        success: true, 
        message: '✅ Old Entry Updated Successfully!' 
      });

    } else {
      // -------------------------------------------------------
      // CASE B: CREATE NEW (Agar Row Nahi Mili)
      // -------------------------------------------------------
      
      // Note: Keys (left side) must match Sheet Headers EXACTLY
      await sheet.addRow({
        id: rowId, // Column header 'id' hona chahiye
        category,
        type,
        image,
        audioUrl,
        title_HI,
        title_EN,
        title_HING,
        desc_HI,
        desc_EN,
        desc_HING,
        content_HI,
        content_EN,
        content_HING
      });

      return NextResponse.json({ 
        success: true, 
        message: '🎉 New Entry Created Successfully!' 
      });
    }

  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}