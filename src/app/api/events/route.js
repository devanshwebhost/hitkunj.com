import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

// Sheet Config
const SHEET_ID = process.env.GOOGLE_SHEET_ID || "1Mec8vzOU-1CH71y88dT-vlXnqgaXCVGKeD6qXyDbecQ";

export async function GET() {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();

    // Sheet check karein
    const sheet = doc.sheetsByTitle['upcoming-events'];
    if (!sheet) {
        return NextResponse.json({ success: false, error: "Sheet 'upcoming-events' not found" }, { status: 404 });
    }

    const rows = await sheet.getRows();
    const events = rows.map(row => ({
      id: row.get('id'),
      title: row.get('title'),
      date: row.get('date'),
      description: row.get('description'),
      image: row.get('image') || '/logo-png.png'
    }));

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    console.error("Events API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}