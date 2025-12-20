import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure fresh data

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

export async function GET() {
  try {
    const doc = await getDoc();
    const sheet = doc.sheetsByTitle['notifications-history'];
    
    if (!sheet) return NextResponse.json({ success: true, notifications: [] });

    const rows = await sheet.getRows();
    // Convert rows to JSON and reverse to show newest first
    const notifications = rows.map(row => ({
      title: row.get('title'),
      message: row.get('message'),
      url: row.get('url'),
      date: row.get('date')
    })).reverse();

    return NextResponse.json({ success: true, notifications });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}