    const fs = require('fs');
const csv = require('csv-parser');
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, update } = require("firebase/database");

// 1. Apna Firebase Config Yahan Paste Karein (Same as firebase.js)
const firebaseConfig = {
  apiKey: "AIzaSyD...", 
  authDomain: "hitkunj-eebc2.firebaseapp.com",
  databaseURL: "https://hitkunj-eebc2-default-rtdb.firebaseio.com/",
  projectId: "hitkunj-eebc2",
};

// Initialize Firebase (Note: Hum 'require' syntax use kar rahe hain script ke liye)
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// --- MIGRATION FUNCTION ---
async function uploadCSV(fileName, nodeName, idColumn = null, jsonColumns = []) {
  const results = [];

  console.log(`📖 Reading ${fileName}...`);

  fs.createReadStream(fileName)
    .pipe(csv())
    .on('data', (data) => {
      // Clean Data: Empty strings ko remove karein
      const cleanData = {};
      Object.keys(data).forEach(key => {
        if (data[key] && data[key].trim() !== "") {
          cleanData[key.trim()] = data[key].trim();
        }
      });

      // Special handling: Agar koi column JSON string hai (jaise 'subscription')
      jsonColumns.forEach(col => {
        if (cleanData[col]) {
          try {
            cleanData[col] = JSON.parse(cleanData[col]);
          } catch (e) {
            console.log(`⚠️ JSON Parse Error in ${col}:`, e.message);
          }
        }
      });

      results.push(cleanData);
    })
    .on('end', async () => {
      console.log(`🚀 Uploading ${results.length} items to '${nodeName}'...`);
      
      const updates = {};
      results.forEach((item, index) => {
        // Agar ID column diya hai to usse key banao, nahi to random ID use karo
        let key;
        if (idColumn && item[idColumn]) {
            key = item[idColumn]; // Use specific ID (e.g., rowId)
        } else {
            key = `item_${index}`; // Ya push ID generate kar sakte hain
        }

        updates[`${nodeName}/${key}`] = item;
      });

      try {
        await update(ref(db), updates);
        console.log(`✅ Success! ${fileName} migrated to Firebase node: ${nodeName}`);
      } catch (error) {
        console.error("❌ Error uploading:", error);
      }
    });
}

// --- COMMANDS TO RUN (Uncomment jo file upload karni ho) ---

// 1. LIBRARY / CONTENT (Sheet Name: Items/Library)
// 'library.csv' file ka naam hai, 'content_items' firebase node hai, 'id' wo column hai jo unique ID hai
// uploadCSV('Items.csv', 'content_items', 'id');

// 2. USERS (Sheet Name: user-data-notification)
// 'subscription' column JSON format mein hai, isliye last array mein pass kiya
// uploadCSV('users.csv', 'notifications_users', null, ['subscription']);

// 3. EVENTS (Sheet Name: upcoming-events)
// uploadCSV('events.csv', 'upcoming_events', 'id');

// 4. ANALYTICS (Sheet Name: Analytics)
// uploadCSV('analytics.csv', 'analytics', 'id');

// 5. Categories (Sheet Name: Categories)
// Agar aapke CSV mein 'id' column hai to 'id' likhein, agar 'name' hai to 'name' likhein.
// uploadCSV('categories.csv', 'categories', 'id');

// 6. Notifications History (Sheet Name: notifications-history)
// Hum 'null' pass kar rahe hain taaki Firebase har history item ka naya unique ID khud banaye.
uploadCSV('notifications-history.csv', 'notifications_history', null);