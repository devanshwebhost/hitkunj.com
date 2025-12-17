"use client";
import { useLibraryData } from '@/hooks/useLibraryData';
import { useAboutData } from '@/hooks/useAboutData';

export default function DataPrefetch() {
  // Hum yahan hook ko bina kisi 'category' ke call kar rahe hain.
  // Isse aapka hook 'else setData(parsed)' wale part me jayega 
  // aur SARA data fetch karke localStorage me daal dega.
  useLibraryData(); 
  useAboutData();

  return null; // Ye screen par kuch nahi dikhayega
}