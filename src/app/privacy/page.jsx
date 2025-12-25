"use client";
import { useLanguage } from '@/context/LanguageContext';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPage() {
  const { language } = useLanguage();

  const content = {
    EN: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: December 2024",
      intro: "Welcome to Hitkunj. Your privacy is important to us. This policy explains how we handle your data.",
      sections: [
        {
          title: "1. Information We Collect",
          text: "We do not collect personal data like email or phone numbers from visitors. We only use LocalStorage to save your preferences (Language, Bookmarks, and Highlights)."
        },
        {
          title: "2. Content Ownership (Audio & Images)",
          text: "• **Original Audio:** All audio content (Pad Gayan, Vani) on this site is originally recorded and produced by the Hitkunj Team. Unauthorized commercial use is prohibited.\n• **AI Generated Images:** All images on this website are generated using Artificial Intelligence (Google Gemini). These are artistic representations for spiritual purposes."
        },
        {
          title: "3. Cookies & Tracking",
          text: "We use basic analytics (like Firebase/Google Analytics) to understand which pages are popular. This data is anonymous and does not track your personal identity."
        },
        {
          title: "4. Contact Us",
          text: "If you have any questions regarding our policies, please contact us via our social media handles."
        }
      ]
    },
    HI: {
      title: "गोपनीयता नीति (Privacy Policy)",
      lastUpdated: "अंतिम अपडेट: दिसंबर 2024",
      intro: "हितकुंज में आपका स्वागत है। आपकी गोपनीयता हमारे लिए महत्वपूर्ण है। यह नीति बताती है कि हम आपके डेटा को कैसे संभालते हैं।",
      sections: [
        {
          title: "1. जानकारी जो हम एकत्र करते हैं",
          text: "हम आगंतुकों से ईमेल या फोन नंबर जैसी कोई व्यक्तिगत जानकारी एकत्र नहीं करते हैं। हम आपकी वरीयताओं (भाषा, बुकमार्क) को सहेजने के लिए केवल LocalStorage का उपयोग करते हैं।"
        },
        {
          title: "2. सामग्री स्वामित्व (ऑडियो और चित्र)",
          text: "• **मूल ऑडियो:** इस साइट पर सभी ऑडियो सामग्री (पद गायन, वाणी) मूल रूप से हितकुंज टीम द्वारा रिकॉर्ड और निर्मित की गई है। इसका व्यावसायिक उपयोग वर्जित है।\n• **AI जनित चित्र:** इस वेबसाइट पर सभी चित्र आर्टिफिशियल इंटेलिजेंस (Google Gemini) का उपयोग करके बनाए गए हैं। ये आध्यात्मिक उद्देश्यों के लिए कलात्मक प्रस्तुतियाँ हैं।"
        },
        {
          title: "3. कुकीज़ और ट्रैकिंग",
          text: "हम यह समझने के लिए कि कौन से पेज लोकप्रिय हैं, सामान्य एनालिटिक्स (जैसे Firebase) का उपयोग करते हैं। यह डेटा गुमनाम है और आपकी व्यक्तिगत पहचान को ट्रैक नहीं करता है।"
        },
        {
          title: "4. संपर्क करें",
          text: "यदि आपके पास हमारी नीतियों के संबंध में कोई प्रश्न हैं, तो कृपया हमारे सोशल मीडिया हैंडल के माध्यम से हमसे संपर्क करें।"
        }
      ]
    },
    HING: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated: Dec 2024",
      intro: "Hitkunj par aapka swagat hai. Aapki privacy humare liye important hai.",
      sections: [
        {
          title: "1. Hum Kya Info Collect Karte Hain?",
          text: "Hum aapse koi personal data (email, phone) nahi lete. Hum bas LocalStorage use karte hain taaki aapki Language aur Bookmarks save rahein."
        },
        {
          title: "2. Content Rights (Audio & Images)",
          text: "• **Original Audio:** Site par jitne bhi audios hain (Pad, Vani), wo sab Hitkunj Team ne khud record kiye hain. Iska commercial use mana hai.\n• **AI Images:** Site ki saari images AI (Google Gemini) se banayi gayi hain. Ye sirf spiritual bhaav ke liye hain."
        },
        {
          title: "3. Cookies & Tracking",
          text: "Hum bas ye dekhne ke liye analytics use karte hain ki kaunsa page zyada dekha ja raha hai. Isme aapka koi personal data nahi liya jata."
        },
        {
          title: "4. Contact Karein",
          text: "Agar koi sawal ho to aap humein social media (Instagram/YouTube) par message kar sakte hain."
        }
      ]
    }
  };

  const t = content[language] || content.EN;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 font-serif">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        
        <div className="text-center mb-12">
            <div className="inline-block p-4 bg-green-50 rounded-full mb-4">
                <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-500 text-sm">{t.lastUpdated}</p>
        </div>

        <div className="space-y-8">
            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-blue-900">
                <p className="text-lg leading-relaxed">{t.intro}</p>
            </div>

            {t.sections.map((section, index) => (
                <div key={index} className="border-b border-gray-100 pb-8 last:border-0">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        {section.title}
                    </h2>
                    <p className="text-gray-600 leading-loose whitespace-pre-line">
                        {section.text}
                    </p>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}