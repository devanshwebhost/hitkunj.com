import { Inter } from "next/font/google";
import "./globals.css";
import DataPrefetch from "@/components/DataPrefetch";
import { LanguageProvider } from "@/context/LanguageContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FloatingActions from "@/components/FloatingActions";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

// SEO Metadata Updated
export const metadata = {
  metadataBase: new URL('https://hitkunj.vercel.app'), // अपनी असली डोमेन
  title: {
    default: "Hitkunj - Radhavallab Sampradaye | Hit Harivansh",
    template: "%s | Hitkunj"
  },
  description: "Radhavallab Sampradaye ki Sampurna Jankari. Hit Harivansh Mahaprabhu, Rasik Sant, Pad Gayan, Utsav aur Vrindavan ke nitya vihar ki jankari prapt karein.",
  keywords: ["Hitkunj", "Radhavallabh", "Hit Harivansh", "Vrindavan", "Premanand Ji", "Rasik Sant", "Bhajan", "Kirtan", "Radha Krishna"],
  authors: [{ name: "Hitkunj Team" }],
  creator: "Indocs Media",
  publisher: "Hitkunj",
  
  // ✅ NEW: Canonical URL (Duplicate Content se bachne ke liye)
  alternates: {
    canonical: './', 
  },

  // Open Graph (Facebook/WhatsApp Sharing ke liye)
  openGraph: {
    title: "Hitkunj - Radhavallab Sampradaye",
    description: "Radhavallab Sampradaye aur Rasik Santon ki sampurna jankari.",
    url: 'https://hitkunj.vercel.app',
    siteName: 'Hitkunj',
    images: [
      {
        url: '/logo-png.png',
        width: 800,
        height: 600,
        alt: 'Hitkunj Logo',
      },
    ],
    locale: 'hi_IN',
    type: 'website',
  },

  // Google Console Verification Placeholder
  verification: {
    google: 'YAHAN_GOOGLE_VERIFICATION_CODE_AAYEGA', // Google Search Console se code lekar yahan dalein
  },
  
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  // ✅ NEW: Schema Markup (Organization Info)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Hitkunj - Hit Harivansh Sewa',
    url: 'https://hitkunj.vercel.app',
    logo: 'https://hitkunj.vercel.app/logo-png.png',
    sameAs: [ // Yahan apne asli social links dalein
      'https://www.instagram.com/shrihitkunj?igsh=aThtczJvMDVyMjRv' 
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'Hindi']
    }
  };

  return (
    <html lang="hi">
      <head>
        <link rel="icon" href="/logo-png.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        
        {/* ✅ Schema Script injected here */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <LanguageProvider>
          <Navbar/>
          <DataPrefetch />
          <FloatingActions />
          {children}
          <Footer />
        </LanguageProvider>
        {/* ✅ Yahan Add Karein (Google Analytics se ID lekar) */}
        <GoogleAnalytics GA_MEASUREMENT_ID="G-MZTZTYD3WC" />
      </body>
    </html>
  );
}