import LibraryDetailClient from "@/components/LibraryDetailClient";
import { db } from "@/lib/firebase"; 
import { ref, get, query, orderByChild, equalTo } from "firebase/database";

// --- 1. ROBUST DATA FETCHING (Query Based) ---
async function getLibraryItem(id) {
  try {
    console.log(`🔍 Searching for ID: ${id}...`);

    const contentRef = ref(db, 'content_items');
    
    // METHOD 1: Direct Key Check (Fastest)
    let snapshot = await get(ref(db, `content_items/${id}`));

    // METHOD 2: Agar Direct nahi mila, to Query se dhundo (Safer)
    if (!snapshot.exists()) {
        console.log("⚠️ Direct Key lookup failed. Trying Query...");
        const q = query(contentRef, orderByChild('id'), equalTo(id));
        snapshot = await get(q);
        
        // Query returns an object with keys, humein first match chahiye
        if (snapshot.exists()) {
            const data = snapshot.val();
            const firstKey = Object.keys(data)[0];
            snapshot = { val: () => data[firstKey], exists: () => true };
        }
    }

    if (snapshot.exists()) {
      const flatItem = snapshot.val();
      console.log("✅ Item Found:", flatItem.id || "Unknown");

      // IMPORTANT: Flat Data ko wapas Nested structure mein convert karein
      // Taaki purana Frontend code (LibraryDetailClient) bina error ke chale
      return {
        ...flatItem,
        title: {
          EN: flatItem.title_EN || flatItem.title || "",
          HI: flatItem.title_HI || "",
          HING: flatItem.title_HING || ""
        },
        desc: {
          EN: flatItem.desc_EN || flatItem.desc || "",
          HI: flatItem.desc_HI || "",
          HING: flatItem.desc_HING || ""
        },
        content: {
          EN: flatItem.content_EN || flatItem.content || "",
          HI: flatItem.content_HI || "",
          HING: flatItem.content_HING || ""
        },
        // Folder/Category Fallback
        folderObj: {
           EN: flatItem.folder || "",
           HI: flatItem.folder_HI || ""
        }
      };
    }
    
    console.error("❌ Item Not Found in DB");
    return null;

  } catch (error) {
    console.error("🔥 Firebase Fetch Error:", error);
    return null;
  }
}

// --- 2. METADATA GENERATOR ---
export async function generateMetadata({ params }) {
  const { category, id } = await params || params; 
  const item = await getLibraryItem(id);

  if (!item) return { title: "Content Not Found - HitKunj" };

  const title = item.title?.EN || item.title_EN || "HitKunj Library";
  const desc = item.desc?.EN || item.desc_EN || "Jai Jai Shri Hit Harivansh";
  const imageUrl = item.image || "/logo-png.png";

  return {
    title: `${title} | HitKunj`,
    description: desc,
    openGraph: {
      title, description: desc, url: `https://hitkunj.com/library/${category}/${id}`,
      siteName: 'HitKunj',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      type: 'article',
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [imageUrl] },
  };
}

// --- 3. MAIN PAGE COMPONENT ---
export default async function Page({ params }) {
  const { category, id } = await params || params; // Safe params access for Next.js 15
  const item = await getLibraryItem(id);

  // Error Handling UI
  if (!item) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-black p-4">
            <h1 className="text-2xl font-bold mb-2">Content Not Found</h1>
            <p className="text-gray-600 mb-4">Could not find item with ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{id}</span></p>
            <p className="text-xs text-gray-500">Check if your URL is correct or if the item exists in Database.</p>
        </div>
      );
  }

  // Client Component ko Data Pass karein
  return <LibraryDetailClient preFetchedItem={item} />;
}