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
    const { subscription, name } = await req.json();
    const doc = await getDoc();
    
    // Check Sheet
    let sheet = doc.sheetsByTitle['user-data-notification'];
    if (!sheet) {
        // Nayi Headers: Subscription poora JSON string bankar save hoga
        sheet = await doc.addSheet({ title: 'user-data-notification', headerValues: ['subscription', 'name', 'date'] });
    }

    // Convert Subscription Object to String
    const subString = JSON.stringify(subscription);
    const rows = await sheet.getRows();

    // Duplicate Check
    const existingRow = rows.find(row => row.get('subscription') === subString);

    if (!existingRow) {
      await sheet.addRow({
        subscription: subString,
        name: name || 'Anonymous',
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });
      return NextResponse.json({ success: true, message: '🎉 Subscribed Successfully' });
    }

    return NextResponse.json({ success: true, message: '✅ Already Subscribed' });

  } catch (error) {
    console.error("Save API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}