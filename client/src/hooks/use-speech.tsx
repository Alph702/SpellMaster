import { useCallback } from 'react';

export function useSpeech() {
  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    // Try to find an English voice
    const englishVoice = voices.find(voice => 
      voice.lang.startsWith('en') && !voice.name.includes('Microsoft')
    );

    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    // Optimize for speed and clarity
    utterance.rate = 1.1; // Slightly faster
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  }, []);

  return { speak };
}