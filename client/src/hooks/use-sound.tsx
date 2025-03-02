import { useCallback, useEffect, useRef } from "react";

export function useSound() {
  // Using short, reliable sound effects that work well in web browsers
  const correctSound = useRef(new Audio("https://www.soundjay.com/button/button-09.mp3"));
  const incorrectSound = useRef(new Audio("https://www.soundjay.com/button/button-10.mp3"));

  useEffect(() => {
    // Preload sounds and handle errors
    const preloadSounds = async () => {
      try {
        await Promise.all([
          correctSound.current.load(),
          incorrectSound.current.load()
        ]);
      } catch (error) {
        console.error("Failed to preload sounds:", error);
      }
    };

    preloadSounds();

    // Cleanup
    return () => {
      correctSound.current.pause();
      incorrectSound.current.pause();
    };
  }, []);

  const playCorrect = useCallback(() => {
    try {
      correctSound.current.currentTime = 0;
      const playPromise = correctSound.current.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.error("Failed to play correct sound:", error);
        });
      }
    } catch (error) {
      console.error("Error playing correct sound:", error);
    }
  }, []);

  const playIncorrect = useCallback(() => {
    try {
      incorrectSound.current.currentTime = 0;
      const playPromise = incorrectSound.current.play();
      if (playPromise) {
        playPromise.catch((error) => {
          console.error("Failed to play incorrect sound:", error);
        });
      }
    } catch (error) {
      console.error("Error playing incorrect sound:", error);
    }
  }, []);

  return { playCorrect, playIncorrect };
}