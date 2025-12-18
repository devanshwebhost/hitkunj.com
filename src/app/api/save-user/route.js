import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "1Mec8vzOU-1CH71y88dT-vlXnqgaXCVGKeD6qXyDbecQ";

export async function POST(req) {
  try {
    const { name, status } = await req.json();
    
    // Auth Setup
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Sheet Selection
    let sheet = doc.sheetsByTitle['user-data-notification'];
    
    // Agar sheet nahi hai to code se hi create kar lo
    if (!sheet) {
        sheet = await doc.addSheet({ title: 'user-data-notification', headerValues: ['name', 'status', 'date'] });
    }

    // Add Row
    await sheet.addRow({
      name: name || 'Anonymous',
      status: status, 
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save User API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}