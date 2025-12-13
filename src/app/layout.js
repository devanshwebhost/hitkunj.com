import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext"; // Import kiya

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Hit Harivansh Sewa",
  description: "Vrindavan Rasik Sant Digital Library",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Yahan Provider wrap karein */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}