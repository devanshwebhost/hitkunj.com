"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';


  

export default function FeedbackForm() {
  const [recommendation, setRecommendation] = useState('');
  const [status, setStatus] = useState('');
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    // Yahan aapka Google Apps Script URL aayega
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTQF0bJIHkL3f5vvUY0F30QpV_OKZLK7oFM4mEZQRpIahtePyeUM700sPEqO3SObPI/exec"; 

    try {
      // Filhal testing ke liye console log
      console.log("Sending:", recommendation);
      
      /* // Real implementation:
      await fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify({ recommendation, date: new Date() }),
      });
      */
      
      setStatus('Radhe Radhe! Aapka sujhaav mil gaya.');
      setRecommendation('');
    } catch (error) {
      setStatus('Kuch gadbad ho gayi.');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-spiritual-gold mt-10 max-w-2xl mx-auto"
    >
      <h3 className="text-xl text-black font-bold text-spiritual-dark mb-2 text-center">
        {t('feedback_title')}
      </h3>
      <p className="text-center text-gray-600 mb-4 text-sm">
        {t('feedback_desc')}
      </p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <textarea
          className="w-full text-black italic  p-3 rounded-lg border border-spiritual-sky focus:ring-2 focus:ring-spiritual-gold outline-none bg-white/80"
          rows="3"
          placeholder={t('feedback_desc')}
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          required
        />
        <button 
          type="submit" 
          className=" bg-amber-400 from-spiritual-sky to-spiritual-amber text-black py-2 px-6 rounded-full font-bold shadow-md hover:scale-105 transition transform active:scale-95"
        >
          {t('btn_submit')}
        </button>
        {status && <p className="text-center font-medium text-spiritual-dark animate-pulse">{status}</p>}
      </form>
    </motion.div>
  );
}