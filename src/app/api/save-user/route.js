export async function POST(req) {
  try {
    const { userId, name, action, status } = await req.json();
    const doc = await getDoc(); // GoogleSheet Auth
    let sheet = doc.sheetsByTitle['user-data-notification'];
    
    if (!sheet) {
        sheet = await doc.addSheet({ title: 'user-data-notification', headerValues: ['userId', 'name', 'action', 'status', 'date'] });
    }

    const rows = await sheet.getRows();

    // ✅ CHECK DUPLICATE: Device ID (userId) se dhundo
    const existingRow = rows.find(row => row.get('userId') === userId);

    if (existingRow) {
      // Agar ID mil gayi, to purana record update karo (Naam aur Status update ho jayega)
      if(name && name !== 'Anonymous') existingRow.set('name', name); 
      existingRow.set('status', status);
      existingRow.set('action', action);
      existingRow.set('date', new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }));
      await existingRow.save();
      return NextResponse.json({ success: true, message: '✅ User Record Updated' });
    } else {
      // Naya User
      await sheet.addRow({
        userId: userId,
        name: name || 'Anonymous',
        action: action,
        status: status, 
        date: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      });
      return NextResponse.json({ success: true, message: '🎉 New User Registered' });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}