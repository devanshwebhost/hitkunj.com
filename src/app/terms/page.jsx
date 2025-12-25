"use client";
import { useLanguage } from '@/context/LanguageContext';
import { ScrollText, AlertCircle } from 'lucide-react';

export default function TermsPage() {
  const { language } = useLanguage();

  const content = {
    EN: {
      title: "Terms and Conditions",
      intro: "By accessing Hitkunj, you agree to the following terms. Please read them carefully.",
      sections: [
        {
          title: "1. Use of Service",
          text: "This website is designed for spiritual and educational purposes related to the Radhavallabh Sampradaya. The content is free for personal use."
        },
        {
          title: "2. Intellectual Property",
          text: "• **Audio Rights:** The audio content is the intellectual property of the Hitkunj Team. You may listen and share for devotion, but you cannot sell or remix it without permission.\n• **Visual Content:** Images are AI-generated and are used here for artistic representation."
        },
        {
          title: "3. User Conduct",
          text: "Users must not misuse the website by attempting to hack, spam, or copy content for malicious purposes. Respect the sanctity of the spiritual content."
        },
        {
          title: "4. Disclaimer",
          text: "While we strive for accuracy in all 'Pad' and 'Vani' texts, errors may occur. We encourage users to verify with original scriptures if needed."
        }
      ]
    },
    HI: {
      title: "नियम और शर्तें (Terms)",
      intro: "हितकुंज का उपयोग करके, आप निम्नलिखित शर्तों से सहमत होते हैं। कृपया उन्हें ध्यान से पढ़ें।",
      sections: [
        {
          title: "1. सेवा का उपयोग",
          text: "यह वेबसाइट राधावल्लभ संप्रदाय से संबंधित आध्यात्मिक और शैक्षिक उद्देश्यों के लिए बनाई गई है। सामग्री व्यक्तिगत उपयोग के लिए निःशुल्क है।"
        },
        {
          title: "2. बौद्धिक संपदा (Intellectual Property)",
          text: "• **ऑडियो अधिकार:** ऑडियो सामग्री हितकुंज टीम की संपत्ति है। आप इसे भक्ति के लिए सुन और साझा कर सकते हैं, लेकिन बिना अनुमति के इसे बेच नहीं सकते।\n• **दृश्य सामग्री:** चित्र AI-जनित हैं और यहाँ कलात्मक प्रस्तुति के लिए उपयोग किए गए हैं।"
        },
        {
          title: "3. उपयोगकर्ता आचरण",
          text: "उपयोगकर्ताओं को वेबसाइट का दुरुपयोग नहीं करना चाहिए। आध्यात्मिक सामग्री की पवित्रता का सम्मान करें।"
        },
        {
          title: "4. अस्वीकरण (Disclaimer)",
          text: "हालांकि हम सभी 'पद' और 'वाणी' पाठों में सटीकता का प्रयास करते हैं, फिर भी त्रुटियां हो सकती हैं। हम उपयोगकर्ताओं को मूल ग्रंथों से सत्यापित करने के लिए प्रोत्साहित करते हैं।"
        }
      ]
    },
    HING: {
      title: "Terms & Conditions",
      intro: "Hitkunj use karne ka matlab hai ki aap neeche diye gaye rules maante hain.",
      sections: [
        {
          title: "1. Site ka Use",
          text: "Ye website Radhavallabh Sampraday ke prachar aur sewa ke liye hai. Aap yahan ka content personal use ke liye free mein access kar sakte hain."
        },
        {
          title: "2. Content Rights",
          text: "• **Audio:** Saare audios Hitkunj Team ki property hain. Aap suniye, share kijiye, par isse sell nahi kar sakte.\n• **Images:** Images AI generated hain aur spiritual bhaav ke liye lagayi gayi hain."
        },
        {
          title: "3. User Rules",
          text: "Website ko hack ya spam karne ki koshish na karein. Ye ek dharmik site hai, iski maryada banaye rakhein."
        },
        {
          title: "4. Disclaimer",
          text: "Hum koshish karte hain ki saare Pad aur Vani sahi hon, par agar koi galti ho jaye to hum zimmedar nahi hain. Aap original grantho se match kar sakte hain."
        }
      ]
    }
  };

  const t = content[language] || content.EN;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 md:px-8 font-serif">
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        
        <div className="text-center mb-12">
            <div className="inline-block p-4 bg-amber-50 rounded-full mb-4">
                <ScrollText className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-2">{t.title}</h1>
            <p className="text-gray-500 text-sm">Hitkunj Sewa</p>
        </div>

        <div className="space-y-8">
             <div className="bg-amber-50 p-6 rounded-xl border border-amber-100 text-amber-900">
                <p className="text-lg leading-relaxed">{t.intro}</p>
            </div>

            {t.sections.map((section, index) => (
                <div key={index} className="border-b border-gray-100 pb-8 last:border-0">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
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