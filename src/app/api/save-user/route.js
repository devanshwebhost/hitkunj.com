import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

// 1. Auth Function Define Karein (Jo aapke code mein missing tha)
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

export async function POST(req) {
  try {
    const { userId, name, action, status } = await req.json();
    
    // 2. Ab getDoc() call kaam karega
    const doc = await getDoc(); 
    
    let sheet = doc.sheetsByTitle['user-data-notification'];
    
    // 3. Agar sheet nahi hai, to banayein (Headers ke saath)
    if (!sheet) {
        sheet = await doc.addSheet({ 
          title: 'user-data-notification', 
          headerValues: ['userId', 'name', 'action', 'status', 'date'] 
        });
    }

    const rows = await sheet.getRows();

    // 4. Duplicate Check (UserID se)
    const existingRow = rows.find(row => row.get('userId') === userId);

    if (existingRow) {
      // --- UPDATE EXISTING ---
      if(name && name !== 'Anonymous') existingRow.set('name', name); 
      existingRow.set('status', status);
      existingRow.set('action', action);
      existingRow.set('date', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      await existingRow.save();
      return NextResponse.json({ success: true, message: '✅ User Record Updated' });

    } else {
      // --- CREATE NEW ---
      await sheet.addRow({
        userId: userId || 'unknown',
        name: name || 'Anonymous',
        action: action || 'subscribe',
        status: status, 
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });
      return NextResponse.json({ success: true, message: '🎉 New User Registered' });
    }

  } catch (error) {
    console.error("Save API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}