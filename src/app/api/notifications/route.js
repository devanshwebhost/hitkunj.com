import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { title, message, url, scheduleDate } = await req.json();

    const payload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      headings: { "en": title },
      contents: { "en": message },
      url: url || "https://hitkunj.com",
    };

    // Agar scheduling hai (ISO String format mein)
    if (scheduleDate) {
      payload.send_after = scheduleDate;
    }

    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Authorization": `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}