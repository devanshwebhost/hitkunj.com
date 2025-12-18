import HomeClient from "@/components/HomeClient";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// ✅ YAHAN HAI MAGIC: 3600 seconds = 1 Hour Cache
export const revalidate = 3600; 

const API_URL = "https://script.google.com/macros/s/AKfycbxVjOJt2oR_5aqAaLILycms2eGD6eqhFLLiuZxyVuRURxH-jfHvylya6lE17wGYY09C/exec";
const SHEET_ID = process.env.GOOGLE_SHEET_ID || "1Mec8vzOU-1CH71y88dT-vlXnqgaXCVGKeD6qXyDbecQ";

// Helper
const slugify = (text) => text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-') || "";

// 1. Fetch Full Library Data
async function getLibraryData() {
  try {
    const res = await fetch(API_URL);
    return await res.json();
  } catch (error) {
    console.error("Library Data Fetch Error:", error);
    return null;
  }
}

// 2. Fetch Analytics (Top 3)
async function getAnalyticsData() {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    const sheet = doc.sheetsByTitle['Analytics'];
    if (!sheet) return [];

    const rows = await sheet.getRows();
    
    const data = rows.map(row => ({
        id: row.get('id'),
        views: parseInt(row.get('views') || 0, 10),
        type: row.get('type'),
        title: row.get('title')
    }));

    // Sort High to Low and Take Top 3
    return data.sort((a, b) => b.views - a.views).slice(0, 3);
  } catch (error) {
    console.error("Analytics Fetch Error:", error);
    return [];
  }
}

// 3. MAIN SERVER PAGE
export default async function Page() {
  // Server par data fetch karein
  const [libraryData, topRankings] = await Promise.all([
     getLibraryData(),
     getAnalyticsData()
  ]);

  // Data Merge Logic
  const trendingData = topRankings.map(rank => {
      let image = null;
      let link = '/';
      let titles = { EN: rank.title, HI: null };

      if (libraryData) {
          Object.entries(libraryData).forEach(([catKey, category]) => {
              if (category.items) {
                  // FOLDER Logic
                  if (rank.type === 'folder') {
                      const foundItem = category.items.find(item => item.folder && slugify(item.folder) === rank.id);
                      if (foundItem) {
                          if (!image && foundItem.image) image = foundItem.image;
                          if (foundItem.folder_HI) titles.HI = foundItem.folder_HI;
                          if (foundItem.folder) titles.EN = foundItem.folder;
                      }
                      link = `/lab/${rank.id}`;
                  }
                  // ITEM Logic
                  else if (rank.type === 'item') {
                      const foundItem = category.items.find(item => String(item.id) === String(rank.id));
                      if (foundItem) {
                          image = foundItem.image;
                          const finalCat = foundItem.category || catKey;
                          link = `/library/${finalCat}/${foundItem.id}`;
                          
                          if (foundItem.title?.HI) titles.HI = foundItem.title.HI;
                          if (foundItem.title?.EN) titles.EN = foundItem.title.EN;
                      }
                  }
              }
          });
      }

      return {
          id: rank.id,
          defaultTitle: rank.title,
          titles,
          views: rank.views,
          type: rank.type,
          image: image || '/logo-png.png',
          link: link,
          displayTitle: titles.EN || rank.title // Default display
      };
  });

  // Client ko ready-made data pass karein
  return <HomeClient trendingData={trendingData} />;
}