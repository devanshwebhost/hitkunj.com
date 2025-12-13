import { useState, useEffect } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance();
    setUtterance(u);

    return () => {
      synth.cancel();
    };
  }, []);

  const speak = (text, lang = 'hindi') => {
    if (utterance) {
      utterance.text = text;
      // Agar hindi hai to Hindi voice, nahi to English
      utterance.lang = lang === 'hindi' ? 'hi-IN' : 'en-US'; 
      utterance.rate = 0.9; // Thoda dheere aur spasht
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);

      utterance.onend = () => {
        setIsSpeaking(false);
      };
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return { speak, stop, isSpeaking };
};