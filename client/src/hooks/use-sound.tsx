import { useCallback } from "react";

const correctSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2018/ding-correct-answer.wav");
const incorrectSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2019/wrong-answer-buzz.wav");

export function useSound() {
  const playCorrect = useCallback(() => {
    correctSound.currentTime = 0;
    correctSound.play();
  }, []);

  const playIncorrect = useCallback(() => {
    incorrectSound.currentTime = 0;
    incorrectSound.play();
  }, []);

  return { playCorrect, playIncorrect };
}
