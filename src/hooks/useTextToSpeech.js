import { useState, useEffect } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [synth, setSynth] = useState(null);
  const [voices, setVoices] = useState([]);

  // 1. Browser ki saari awazein (voices) load karein
  useEffect(() => {
    // Client side check
    if (typeof window !== 'undefined') {
      const synthesis = window.speechSynthesis;
      setSynth(synthesis);

      const updateVoices = () => {
        setVoices(synthesis.getVoices());
      };

      // Chrome me voices async load hoti hain, isliye listener lagana padta hai
      updateVoices();
      if (synthesis.onvoiceschanged !== undefined) {
        synthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  const speak = (text, langCode = 'HI') => {
    if (!synth) return;

    // Purana kuch bol raha ho to chup karao
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // 2. Sahi Voice dhoondhna (Sabse Important Step)
    let selectedVoice = null;

    if (langCode === 'HI' || langCode === 'HING') {
      // Pehle koshish karo 'Google Hindi' ya koi bhi Hindi voice mil jaye
      selectedVoice = voices.find(v => v.lang.includes('hi') || v.name.includes('Hindi'));
    } else {
      // English ke liye
      selectedVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US'));
    }

    // Agar voice mil gayi to set karo, warna default chalne do
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    // 3. Settings adjust karein (Spiritual feel ke liye)
    utterance.rate = 0.85; // Speed: 1 normal hai, 0.85 thoda dheere (shant) hai
    utterance.pitch = 1.0; // Pitch normal rakhein
    utterance.volume = 1.0; 

    // Event Listeners
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
    setIsSpeaking(true);
  };

  const stop = () => {
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  return { speak, stop, isSpeaking };
};