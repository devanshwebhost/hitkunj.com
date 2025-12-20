import webpush from 'web-push';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { NextResponse } from 'next/server';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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
    const sheet = doc.sheetsByTitle['user-data-notification'];
    const rows = await sheet.getRows();

    const payload = JSON.stringify({ title, message, url });

    let successCount = 0;

    // Sabhi users ko loop karke bhejo
    const promises = rows.map(async (row) => {
        try {
            const sub = JSON.parse(row.get('subscription'));
            await webpush.sendNotification(sub, payload);
            successCount++;
        } catch (err) {
            if (err.statusCode === 410) {
                // User ne permission revoke kar di, row delete kar sakte hain
                await row.delete();
            }
            console.error("Failed to send:", err.message);
        }
    });

    await Promise.all(promises);

    return NextResponse.json({ success: true, sentTo: successCount });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}