import { useState, useEffect } from 'react';

export function useAudioReader() {
  const [isPlaying, setIsPlaying] = useState(false);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any active reading
      if (!text) return;

      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower pace for clear comprehension
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      window.console.warn('Speech synthesis not supported in this browser.');
    }
  };

  const stop = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { speak, stop, isPlaying };
}
