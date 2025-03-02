import { useCallback, useEffect, useRef } from "react";

export function useSound() {
  const correctSound = useRef(new Audio("https://cdn.freesound.org/sounds/683/683425_12494604-lq.mp3"));
  const incorrectSound = useRef(new Audio("https://cdn.freesound.org/sounds/683/683424_12494604-lq.mp3"));

  useEffect(() => {
    // Preload sounds
    correctSound.current.load();
    incorrectSound.current.load();
  }, []);

  const playCorrect = useCallback(() => {
    try {
      correctSound.current.currentTime = 0;
      correctSound.current.play().catch(console.error);
    } catch (error) {
      console.error("Failed to play correct sound:", error);
    }
  }, []);

  const playIncorrect = useCallback(() => {
    try {
      incorrectSound.current.currentTime = 0;
      incorrectSound.current.play().catch(console.error);
    } catch (error) {
      console.error("Failed to play incorrect sound:", error);
    }
  }, []);

  return { playCorrect, playIncorrect };
}