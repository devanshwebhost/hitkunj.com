import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "1Mec8vzOU-1CH71y88dT-vlXnqgaXCVGKeD6qXyDbecQ";

export async function POST(req) {
  try {
    // ✅ Data receive karein: userId bhi aayega ab
    const { userId, name, action, status } = await req.json();
    
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    let sheet = doc.sheetsByTitle['user-data-notification'];
    
    // ✅ Header me 'userId' aur 'action' add kiya
    if (!sheet) {
        sheet = await doc.addSheet({ title: 'user-data-notification', headerValues: ['userId', 'name', 'action', 'status', 'date'] });
    }

    const rows = await sheet.getRows();

    // ✅ CHECK DUPLICATE: User ID aur Action match karo
    // Agar userId nahi hai (purane users), to name se check karo fallback ke liye
    const existingRow = rows.find(row => {
        if (userId) return row.get('userId') === userId && row.get('action') === action;
        return false; 
    });

    if (existingRow) {
      // --- UPDATE ---
      existingRow.set('status', status);
      if(name) existingRow.set('name', name); // Name bhi update kar do agar naya hai
      existingRow.set('date', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      await existingRow.save();
      return NextResponse.json({ success: true, message: '✅ Updated Existing User' });

    } else {
      // --- CREATE NEW ---
      await sheet.addRow({
        userId: userId || 'unknown',
        name: name || 'Anonymous',
        action: action || 'subscribe',
        status: status, 
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });
      return NextResponse.json({ success: true, message: '🎉 New User Added' });
    }

  } catch (error) {
    console.error("Save User API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}