import { db } from "@/lib/firebase";
import { ref, get } from "firebase/database";

// Helper: Slug bananane ke liye
const slugify = (text) =>
  text
    ?.toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-') || "";

export default async function sitemap() {
  const baseUrl = 'https://hitkunj.vercel.app'; // Apni Domain

  // 1. Static Pages
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/lab`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/about-sampradaye`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/utsavs_in_radhavallabh_ji`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    // 2. Firebase se Data lo
    // Note: Isme thoda time lag sakta hai build time par
    const snapshot = await get(ref(db, 'content_items'));
    
    if (!snapshot.exists()) return staticRoutes;

    const items = Object.values(snapshot.val());
    
    // --- A. Dynamic Library Items (Pads/Vani) ---
    const itemRoutes = items.map((item) => ({
      url: `${baseUrl}/library/${item.category || 'general'}/${item.id}`,
      lastModified: new Date(item.date || Date.now()), // Agar date hai to use karein
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // --- B. Dynamic Folders ---
    // Pehle unique folders nikalein
    const uniqueFolders = new Set();
    items.forEach(item => {
        if(item.folder) uniqueFolders.add(slugify(item.folder));
    });

    const folderRoutes = Array.from(uniqueFolders).map((slug) => ({
      url: `${baseUrl}/lab/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // Sabko Jod do
    return [...staticRoutes, ...folderRoutes, ...itemRoutes];

  } catch (error) {
    console.error("Sitemap Generation Error:", error);
    return staticRoutes;
  }
}