import HomeClient from "@/components/HomeClient";
import { db } from "@/lib/firebase"; // Firebase Connection
import { ref, get } from "firebase/database";

// Cache: 1 Hour (Agar aapko instant updates chahiye to isse 0 kar dein)
export const revalidate = 3600; 

// Helper function for URL slugs
const slugify = (text) => text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-') || "";

// 1. Fetch Full Library Data from Firebase
async function getLibraryItems() {
  try {
    // 'content_items' node se sara data layein
    const snapshot = await get(ref(db, 'content_items'));
    if (snapshot.exists()) {
        return snapshot.val(); // Returns { id1: item1, id2: item2 ... }
    }
    return {};
  } catch (error) {
    console.error("Library Data Fetch Error:", error);
    return {};
  }
}

// 2. Fetch Analytics (Top 3) from Firebase
async function getAnalyticsData() {
  try {
    const snapshot = await get(ref(db, 'analytics'));

    if (!snapshot.exists()) return [];

    const data = [];
    snapshot.forEach(child => {
        const val = child.val();
        data.push({
            id: child.key, // Firebase ID
            views: parseInt(val.views || 0, 10),
            type: val.type,
            title: val.title || "Unknown"
        });
    });

    // Sort High to Low and Take Top 3
    return data.sort((a, b) => b.views - a.views).slice(0, 3);
  } catch (error) {
    console.error("Analytics Fetch Error:", error);
    return [];
  }
}

// 3. MAIN SERVER PAGE
export default async function Page() {
  // Parallel Fetching for Speed
  const [libraryItems, topRankings] = await Promise.all([
     getLibraryItems(),
     getAnalyticsData()
  ]);

  // Library Object ko Array me convert karein (Searching ke liye)
  const libraryArray = Object.values(libraryItems);

  // Data Merge Logic
  const trendingData = topRankings.map(rank => {
      let image = null;
      let link = '/';
      let titles = { EN: rank.title, HI: null };
      let foundItem = null;

      if (rank.type === 'folder') {
          // Folder Logic: Array me dhoondo jiska folder name match kare
          foundItem = libraryArray.find(item => item.folder && slugify(item.folder) === rank.id);
          
          if (foundItem) {
              // Firebase me flat structure hai (title_HI, folder_HI etc.)
              if (foundItem.folder_HI) titles.HI = foundItem.folder_HI;
              if (foundItem.folder) titles.EN = foundItem.folder;
              link = `/lab/${rank.id}`;
          }
      } else {
          // Item Logic: Direct ID se dhoondo (Fastest)
          // Pehle direct key check karo, nahi to array me id match karo
          foundItem = libraryItems[rank.id] || libraryArray.find(item => String(item.id) === String(rank.id));
          
          if (foundItem) {
             const cat = foundItem.category || "General";
             link = `/library/${cat}/${foundItem.id}`;
             
             // Titles set karein (Firebase Flat Structure use karke)
             if (foundItem.title_HI) titles.HI = foundItem.title_HI;
             if (foundItem.title_EN) titles.EN = foundItem.title_EN;
          }
      }

      // Image set karein
      if (foundItem && foundItem.image) {
          image = foundItem.image;
      }

      return {
          id: rank.id,
          defaultTitle: rank.title,
          titles,
          views: rank.views,
          type: rank.type,
          image: image || '/logo-png.png',
          link: link,
          displayTitle: titles.EN || rank.title
      };
  });

  // Client Component ko data pass karein
  return <HomeClient trendingData={trendingData} />;
}