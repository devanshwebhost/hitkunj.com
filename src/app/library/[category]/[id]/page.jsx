import LibraryDetailClient from "@/components/LibraryDetailClient";

// Wahi API URL
const API_URL = "https://script.google.com/macros/s/AKfycbxVjOJt2oR_5aqAaLILycms2eGD6eqhFLLiuZxyVuRURxH-jfHvylya6lE17wGYY09C/exec";

// --- 1. SERVER SIDE DATA FETCHING (Helper) ---
async function getLibraryItem(id, category) {
  try {
    // Next.js request ko dedupe (reuse) kar lega, to double API call nahi hogi
    const res = await fetch(API_URL, { next: { revalidate: 3600 } });
    const data = await res.json();
    
    let item = null;
    
    // Step 1: Specific category check
    if (data[category] && data[category].items) {
        item = data[category].items.find((i) => String(i.id) === String(id));
    }
    
    // Step 2: Global Search (Fallback)
    if(!item) {
        Object.values(data).forEach(cat => {
            if(cat.items) {
                const found = cat.items.find((i) => String(i.id) === String(id));
                if(found) item = found;
            }
        })
    }
    return item;
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// --- 2. METADATA GENERATOR ---
export async function generateMetadata({ params }) {
  const { category, id } = params;
  const item = await getLibraryItem(id, category);

  if (!item) return { title: "Content Not Found - HitKunj" };

  const title = item.title?.EN || item.title?.HI || "HitKunj Library";
  const desc = item.desc?.EN || item.desc?.HI || "Jai Jai Shri Hit Harivansh";
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

// --- 3. MAIN PAGE COMPONENT (UPDATED) ---
// Ab hum yahan data fetch karke client ko de rahe hain
export default async function Page({ params }) {
  const { category, id } = params;
  const item = await getLibraryItem(id, category); // Data fetch kiya

  // Client component ko 'preFetchedItem' pass kiya
  return <LibraryDetailClient preFetchedItem={item} />;
}