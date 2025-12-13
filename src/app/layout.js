import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Footer from "@/components/Footer"; // Footer import kiya

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
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          {children}
          <Footer />  {/* Footer children ke neeche */}
        </LanguageProvider>
      </body>
    </html>
  );
}
