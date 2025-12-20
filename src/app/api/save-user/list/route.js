import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function GET() {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    const sheet = doc.sheetsByTitle['user-data-notification'];
    if (!sheet) {
      return NextResponse.json({ success: true, users: [] });
    }

    const rows = await sheet.getRows();
    
    // Rows ko clean object format mein convert karein
    const users = rows.map(row => ({
      userId: row.get('userId'),
      name: row.get('name'),
      action: row.get('action'),
      status: row.get('status'),
      date: row.get('date'),
    }));

    return NextResponse.json({ success: true, users });

  } catch (error) {
    console.error("List Users API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}