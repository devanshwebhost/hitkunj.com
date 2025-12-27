import { Inter } from "next/font/google";
import "./globals.css";
import DataPrefetch from "@/components/DataPrefetch";
import { LanguageProvider } from "@/context/LanguageContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FloatingActions from "@/components/FloatingActions";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { UserProvider } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"] });

// SEO Metadata
export const metadata = {
  metadataBase: new URL('https://jeevanhariavnsh.vercel.app'),
  title: {
    default: "Jeevan Harivansh - Radhavallab Sampradaye | Hit Harivansh", // UPDATED
    template: "%s | Jeevan Harivansh" // UPDATED
  },
  description: "Radhavallab Sampradaye ki Sampurna Jankari. Hit Harivansh Mahaprabhu, Rasik Sant, Pad Gayan, Utsav aur Vrindavan ke nitya vihar ki jankari prapt karein.",
  keywords: ["Jeevan Harivansh", "Radhavallabh", "Hit Harivansh", "Vrindavan", "Premanand Ji", "Rasik Sant", "Bhajan", "Kirtan", "Radha Krishna"],
  authors: [{ name: "Indocs Media Team" }],
  creator: "Indocs Media",
  publisher: "Jeevan Harivansh",
  
  alternates: {
    canonical: './', 
  },

  openGraph: {
    title: "Jeevan Harivansh - Radhavallab Sampradaye | Hit Harivansh",
    description: "Radhavallab Sampradaye aur Rasik Santon ki sampurna jankari.",
    url: 'https://jeevanhariavnsh.vercel.app',
    siteName: 'Jeevan Harivansh', // Ye OpenGraph ke liye hai
    images: [
      {
        url: '/logo-png.png',
        width: 800,
        height: 600,
        alt: 'Jeevan Harivansh Logo',
      },
    ],
    locale: 'hi_IN',
    type: 'website',
  },

  verification: {
    google: 'nBGCZulE-EYKPuYIQiKSTddwT7-VvrJSy7dNLaQRx8Q',
  },
  
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  // ✅ UPDATED: Added WebSite Schema specifically to fix the "Vercel" name issue
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',      // <-- Ye sabse important part hai Google Search ke liye
        name: 'Jeevan Harivansh',         // UPDATED
        alternateName: ['Jeevan Harivansh App', 'shri harivansh', 'hit harivansh', 'radhavallabh sampradaye', 'rasik sant', 'hit harivansh sewa'],
        url: 'https://jeevanhariavnsh.vercel.app',
      },
      {
        '@type': 'Organization', // <-- Ye aapka purana wala code (Knowledge panel ke liye)
        name: 'Jeevan Harivansh - Hit Harivansh Sewa', // UPDATED
        url: 'https://jeevanhariavnsh.vercel.app', // UPDATED
        logo: 'https://jeevanhariavnsh.vercel.app/logo-png.png',
        sameAs: [
          'https://www.instagram.com/shrihitkunj?igsh=aThtczJvMDVyMjRv' 
        ],
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          areaServed: 'IN',
          availableLanguage: ['en', 'Hindi']
        }
      }
    ]
  };

  return (
    <html lang="hi">
      <head>
        <link rel="icon" href="/logo-png.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        
        {/* Schema Script */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <LanguageProvider>
          <UserProvider>
          <Navbar/>
          <DataPrefetch />
          <FloatingActions />
          {children}
          <Footer />
          </UserProvider>
        </LanguageProvider>
        
        <GoogleAnalytics GA_MEASUREMENT_ID="G-MZTZTYD3WC" />
      </body>
    </html>
  );
}