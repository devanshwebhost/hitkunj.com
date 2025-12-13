"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function FeedbackForm() {
  const { t } = useLanguage();
  const [recommendation, setRecommendation] = useState('');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 3 waala URL yahan paste karein
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw6iYw64dL-8Yx83jHHSssVuHYe16eQ3rCEtUWBk2MphVVABwkDyuC7HDRE_s18fmovcA/exec"; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('Bhej rahe hain... (Sending)');

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        // Google Script simple TEXT data accept karta hai CORS avoid karne ke liye
        body: JSON.stringify({ recommendation }), 
        mode: "no-cors" // Yeh zaroori hai taaki browser error na de
      });

      // Kyunki hum 'no-cors' use kar rahe hain, hum maan ke chalenge success hua
      setStatus('Radhe Radhe! Aapka sujhaav mil gaya. 🙏');
      setRecommendation('');
      
    } catch (error) {
      console.error("Error:", error);
      setStatus('Error! Kripya dubara koshish karein.');
    } finally {
      setIsSubmitting(false);
      
      // 3 second baad status hata dein
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-spiritual-gold mt-10 max-w-2xl mx-auto"
    >
      <h3 className="text-xl font-bold text-spiritual-dark text-black mb-2 text-center">
        {t('feedback_title')}
      </h3>
      <p className="text-center text-gray-600 mb-4 text-sm">
        {t('feedback_desc')}
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className="w-full p-3 text-black rounded-lg border border-spiritual-sky focus:ring-2 focus:ring-spiritual-gold outline-none bg-white/80 text-spiritual-dark"
          rows="3"
          placeholder="Ex: Radha Rani ke purane pad add karein..."
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          required
        />
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`bg-gradient-to-r from-spiritual-sky to-spiritual-amber text-black py-2 px-6 rounded-full font-bold shadow-md transition transform active:scale-95 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'}`}
        >
          {isSubmitting ? 'Sending...' : t('btn_submit')}
        </button>
        
        {status && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center font-medium text-spiritual-dark bg-spiritual-light/50 py-2 rounded-lg"
          >
            {status}
          </motion.p>
        )}
      </form>
    </motion.div>
  );
}