import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

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
    const { title, message, url } = await req.json();
    const doc = await getDoc();
    
    // Check or create 'notifications-history' sheet
    let sheet = doc.sheetsByTitle['notifications-history'];
    if (!sheet) {
        sheet = await doc.addSheet({ title: 'notifications-history', headerValues: ['title', 'message', 'url', 'date'] });
    }

    await sheet.addRow({
      title,
      message,
      url: url || '',
      date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    });

    return NextResponse.json({ success: true, message: 'Notification Saved to History' });

  } catch (error) {
    console.error("Save Notification Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}