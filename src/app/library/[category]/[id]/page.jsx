import LibraryDetailClient from "@/components/LibraryDetailClient";
import { db } from "@/lib/firebase"; 
import { ref, get, query, orderByChild, equalTo } from "firebase/database";

// --- 1. ROBUST DATA FETCHING (Same as before) ---
async function getLibraryItem(id) {
  try {
    const contentRef = ref(db, 'content_items');
    
    // METHOD 1: Direct Key Check
    let snapshot = await get(ref(db, `content_items/${id}`));

    // METHOD 2: Query Fallback
    if (!snapshot.exists()) {
        const q = query(contentRef, orderByChild('id'), equalTo(id));
        snapshot = await get(q);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const firstKey = Object.keys(data)[0];
            snapshot = { val: () => data[firstKey], exists: () => true };
        }
    }

    if (snapshot.exists()) {
      const flatItem = snapshot.val();
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
        folderObj: {
           EN: flatItem.folder || "",
           HI: flatItem.folder_HI || ""
        }
      };
    }
    return null;
  } catch (error) {
    console.error("🔥 Firebase Fetch Error:", error);
    return null;
  }
}

// --- 2. ADVANCED METADATA GENERATOR (SEO POWERED) ---
export async function generateMetadata({ params }) {
  const { category, id } = await params; 
  const item = await getLibraryItem(id);

  if (!item) return { title: "Content Not Found - HitKunj" };

  // Data Extraction
  const title = item.title?.EN || item.title_EN || "HitKunj Library";
  const titleHI = item.title?.HI || item.title_HI || title;
  const desc = item.desc?.EN || item.desc_EN || "Radhavallabh Sampradaye content.";
  const imageUrl = item.image || "https://hitkunj.com/logo-png.png";
  const pageUrl = `https://hitkunj.com/library/${category}/${id}`;

  return {
    title: `${title} | ${titleHI} | HitKunj`,
    description: desc,
    keywords: [
        "Hitkunj", "Radhavallabh", "Vrindavan", "Hit Harivansh", 
        category, item.folder || "Library", title, titleHI
    ],
    authors: [{ name: "Hitkunj Team" }],
    creator: "Hitkunj",
    publisher: "Hitkunj",
    
    // ✅ Canonical URL (Duplicate Content se bachne ke liye)
    alternates: {
      canonical: pageUrl,
    },

    // ✅ Robots Control
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Open Graph (Facebook/WhatsApp)
    openGraph: {
      title: title,
      description: desc,
      url: pageUrl,
      siteName: 'HitKunj - Hit Harivansh Sewa',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'hi_IN',
      type: 'article', // Article type for better indexing
      publishedTime: item.date || new Date().toISOString(), // Agar DB me date hai to use karein
      authors: ["Hitkunj Team"],
      section: category,
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: desc,
      images: [imageUrl],
      creator: '@hitkunj', // Agar twitter handle hai
    },
  };
}

// --- 3. MAIN PAGE COMPONENT WITH STRUCTURED DATA ---
export default async function Page({ params }) {
  const { category, id } = await params;
  const item = await getLibraryItem(id);

  if (!item) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-black p-4">
            <h1 className="text-2xl font-bold mb-2">Content Not Found</h1>
            <p className="text-gray-600 mb-4">Could not find item with ID: <span className="font-mono bg-gray-200 px-2 py-1 rounded">{id}</span></p>
        </div>
      );
  }

  // ✅ JSON-LD Schema (Google Rich Results ke liye)
  // Ye Google ko batata hai ki ye ek "Article" hai.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: item.title?.EN || item.title_EN,
    alternativeHeadline: item.title?.HI,
    image: [item.image || "https://hitkunj.com/logo-png.png"],
    datePublished: item.date || new Date().toISOString(),
    dateModified: new Date().toISOString(), // Ideally DB updated time
    author: [{
        '@type': 'Organization',
        name: 'Hitkunj Team',
        url: 'https://hitkunj.com'
    }],
    publisher: {
        '@type': 'Organization',
        name: 'Hitkunj',
        logo: {
            '@type': 'ImageObject',
            url: 'https://hitkunj.com/logo-png.png'
        }
    },
    description: item.desc?.EN || item.desc_EN,
    articleSection: category,
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://hitkunj.com/library/${category}/${id}`
    }
  };
  
  // ✅ Breadcrumb Schema
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://hitkunj.com'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Library',
        item: 'https://hitkunj.com/lab'
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category,
        item: `https://hitkunj.com/library/${category}`
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: item.title?.EN,
        item: `https://hitkunj.com/library/${category}/${id}`
      }
    ]
  };

  return (
    <>
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <LibraryDetailClient preFetchedItem={item} />
    </>
  );
}