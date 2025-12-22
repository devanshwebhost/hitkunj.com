import { Inter } from "next/font/google";
import "./globals.css";
import DataPrefetch from "@/components/DataPrefetch";
import { LanguageProvider } from "@/context/LanguageContext";
import Footer from "@/components/Footer"; // Footer import kiya
import Navbar from "@/components/Navbar";
// import OneSignalSetup from '@/components/OneSignalSetup';
import FloatingActions from "@/components/FloatingActions";
import Notify from "@/components/Notiy";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hitkunj - Radhavallab Smapradaye ki Sampurna Jankari",
  description: "Hitkunj - Radhavallab Smapradaye ki Sampurna Jankari, Rasik Sant, Pad Gayan aur Utsavon ke Vishay mein.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-png.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={inter.className}>
        
        <LanguageProvider>
          <Navbar/>
          <Notify />
          <DataPrefetch />
          {/* <OneSignalSetup /> Yahan add karein */}
          <FloatingActions /> {/* Yahan add karein */}
          {children}
          <Footer />  {/* Footer children ke neeche */}
        </LanguageProvider>
        
      </body>
    </html>
  );
}
