import { db } from "@/lib/firebase"; 
import { ref, get } from "firebase/database";
import FolderClient from "@/components/FolderClient";

// Helper for slugs
const slugify = (text) => text?.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-') || "";

// Helper for formatting name
const formatFolderName = (text) => text ? text.toString().replace(/-/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ') : "";

// --- 1. SERVER SIDE DATA FETCHING ---
async function getFolderData(slug) {
  try {
    // Note: Firebase Realtime DB mein query limited hoti hai, 
    // isliye hum 'content_items' fetch karke filter karenge.
    // Agar data bahut zyada ho jaye to indexing use karni padegi.
    const snapshot = await get(ref(db, 'content_items'));
    
    if (!snapshot.exists()) return null;

    const allItems = snapshot.val();
    let foundItems = [];
    let nameEN = "";
    let nameHI = "";

    Object.values(allItems).forEach((item) => {
        const folderName = item.folder || "";
        if (folderName && slugify(folderName) === slug) {
            foundItems.push(item);
            if (!nameEN) nameEN = formatFolderName(folderName);
            if (!nameHI && item.folder_HI) nameHI = item.folder_HI; 
        }
    });

    if (!nameEN) return null;

    return { 
        name_EN: nameEN, 
        name_HI: nameHI || nameEN, 
        items: foundItems 
    };
  } catch (error) {
    console.error("Folder Fetch Error:", error);
    return null;
  }
}

// --- 2. DYNAMIC METADATA (SEO) ---
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const folderData = await getFolderData(slug);

  if (!folderData) {
    return {
      title: "Folder Not Found | Hitkunj",
      description: "Radhavallab Sampradaye content folder."
    };
  }

  const title = `${folderData.name_EN} (${folderData.name_HI}) | Hitkunj Library`;
  const desc = `Explore collection of ${folderData.name_EN} - ${folderData.name_HI}. Hit Harivansh Mahaprabhu pad, utsav and more.`;
  
  // Pehle item ki image ko preview image banayein
  const previewImage = folderData.items[0]?.image || '/logo-png.png';

  return {
    title: title,
    description: desc,
    openGraph: {
      title: title,
      description: desc,
      images: [
        {
          url: previewImage,
          width: 800,
          height: 600,
          alt: folderData.name_EN,
        },
      ],
    },
  };
}

// --- 3. MAIN SERVER COMPONENT ---
export default async function Page({ params }) {
  const { slug } = await params;
  const folderData = await getFolderData(slug);

  if (!folderData) {
    return <div className="text-white text-center p-10">Folder Not Found</div>;
  }

  return <FolderClient folderData={folderData} slug={slug} />;
}