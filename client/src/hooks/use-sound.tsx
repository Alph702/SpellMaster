import { useCallback, useEffect, useRef } from "react";

export function useSound() {
  const correctSound = useRef(new Audio("/correct.mp3"));
  const incorrectSound = useRef(new Audio("/incorrect.mp3"));

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
      correctSound.current.volume = 0.5; // Lower volume for better user experience
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
      incorrectSound.current.volume = 0.5; // Lower volume for better user experience
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