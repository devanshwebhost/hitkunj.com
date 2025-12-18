import LibraryDetailClient from "@/components/LibraryDetailClient";

// Wahi API URL yahan bhi use karenge
const API_URL = "https://script.google.com/macros/s/AKfycbxVjOJt2oR_5aqAaLILycms2eGD6eqhFLLiuZxyVuRURxH-jfHvylya6lE17wGYY09C/exec";

// --- 1. SERVER SIDE DATA FETCHING ---
async function getLibraryItem(id, category) {
  try {
    // Next.js Server Cache (1 hour tak cache rakhega, taaki Google Script baar baar load na ho)
    const res = await fetch(API_URL, { next: { revalidate: 3600 } });
    const data = await res.json();
    
    // Item dhundein (Same logic as before)
    let item = null;
    
    // Pehle specific category me check karein
    if (data[category] && data[category].items) {
        item = data[category].items.find((i) => String(i.id) === String(id));
    }
    
    // Agar wahan nahi mila, to sab jagah dhundein (Fallback)
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
    console.error("Metadata fetch error:", error);
    return null;
  }
}

// --- 2. GENERATE DYNAMIC METADATA ---
// Ye function WhatsApp/FB ko image aur title batayega
export async function generateMetadata({ params }) {
  const { category, id } = params;
  const item = await getLibraryItem(id, category);

  if (!item) {
    return {
      title: "Content Not Found - HitKunj",
    };
  }

  // Hindi ya English title decide karein (Default English)
  const title = item.title?.EN || item.title?.HI || "HitKunj Library";
  const desc = item.desc?.EN || item.desc?.HI || "Jai Jai Shri Hit Harivansh";
  const imageUrl = item.image || "/logo-png.png"; // Agar image nahi hai to logo use karein

  return {
    title: `${title} | HitKunj`,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      url: `https://hitkunj.com/library/${category}/${id}`,
      siteName: 'HitKunj',
      images: [
        {
          url: imageUrl, // <--- YAHAN MAGIC HOGA (Specific Image Jayegi)
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: desc,
      images: [imageUrl],
    },
  };
}

// --- 3. MAIN COMPONENT ---
// Ye bas Client Component ko render karega
export default function Page() {
  return <LibraryDetailClient />;
}