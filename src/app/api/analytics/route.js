import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

// Auth Function (Same as your update-sheet)
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

// GET: Fetch Analytics Data (Top Views)
export async function GET(req) {
  try {
    const doc = await getDoc();
    // 'Analytics' sheet dhundein (Ensure Sheet Name matches exactly)
    const sheet = doc.sheetsByTitle['Analytics']; 
    if(!sheet) throw new Error("Analytics sheet not found");

    const rows = await sheet.getRows();

    // Data format karein
    const data = rows.map(row => ({
        id: row.get('id'),
        views: parseInt(row.get('views') || 0, 10),
        type: row.get('type')
    }));

    // Descending Order me Sort karein (High to Low)
    data.sort((a, b) => b.views - a.views);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}

// POST: Increment View Count
export async function POST(req) {
    try {
      const { id, title, type } = await req.json();
      if(!id) return NextResponse.json({ error: "No ID" });
  
      const doc = await getDoc();
      // Yahan check karein ki 'Analytics' naam sahi hai sheet me
      let sheet = doc.sheetsByTitle['Analytics'];
      
      // Agar sheet nahi hai to create karein (Optional safe check)
      if (!sheet) {
        sheet = await doc.addSheet({ title: 'Analytics', headerValues: ['id', 'title', 'type', 'views', 'lastUpdated'] });
      }
  
      const rows = await sheet.getRows();
      const existingRow = rows.find((r) => r.get('id') === String(id));
  
      if (existingRow) {
        // View Count Badhayein
        const currentViews = parseInt(existingRow.get('views') || 0, 10);
        existingRow.set('views', currentViews + 1);
        existingRow.set('lastUpdated', new Date().toISOString());
        existingRow.set('title', title); // Title update agar change hua ho
        await existingRow.save();
      } else {
        // Naya Row Banayein
        await sheet.addRow({
          id: String(id),
          title: title || 'Unknown',
          type: type || 'unknown',
          views: 1,
          lastUpdated: new Date().toISOString()
        });
      }
  
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Analytics Error:", error);
      return NextResponse.json({ success: false, error: error.message });
    }
}