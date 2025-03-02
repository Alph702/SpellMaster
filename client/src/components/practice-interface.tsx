import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useSound } from "@/hooks/use-sound";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle } from "lucide-react";

export default function PracticeInterface() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [letters, setLetters] = useState<string[]>([]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { playCorrect, playIncorrect } = useSound();

  const { data: words = [], isLoading } = useQuery({
    queryKey: ["/api/words"],
  });

  const practiceMutation = useMutation({
    mutationFn: async ({
      wordId,
      correct,
    }: {
      wordId: number;
      correct: boolean;
    }) => {
      const res = await apiRequest("POST", "/api/practice", {
        wordId,
        correct,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/words"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const currentWord = words[currentWordIndex];

  useEffect(() => {
    if (currentWord) {
      setLetters(new Array(currentWord.word.length).fill(''));
      inputRefs.current = inputRefs.current.slice(0, currentWord.word.length);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    }
  }, [currentWord]);

  const handleLetterChange = (index: number, value: string) => {
    if (!currentWord) return;

    const newValue = value.toLowerCase();
    if (newValue.length > 1) return;

    const newLetters = [...letters];
    newLetters[index] = newValue;
    setLetters(newLetters);

    if (newValue && index < currentWord.word.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if word is complete
    if (index === currentWord.word.length - 1 && newValue) {
      const enteredWord = newLetters.join('').toLowerCase();
      const correct = enteredWord === currentWord.word.toLowerCase();
      setIsCorrect(correct);
      setShowFeedback(true);

      if (correct) {
        playCorrect();
      } else {
        playIncorrect();
      }

      practiceMutation.mutateAsync({
        wordId: currentWord.id,
        correct,
      });

      setTimeout(() => {
        setShowFeedback(false);
        setLetters(new Array(currentWord.word.length).fill(''));
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }, 1500);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !letters[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const renderWord = () => {
    if (!currentWord) return null;
    const wordLetters = currentWord.word.split('');

    return (
      <div className="flex justify-center space-x-4 text-3xl font-mono my-8">
        {wordLetters.map((letter, index) => {
          const userLetter = letters[index];
          let className = "w-8 h-12 flex items-center justify-center rounded border-2 transition-all duration-200 ";

          if (userLetter) {
            className += userLetter.toLowerCase() === letter.toLowerCase()
              ? "border-primary text-primary"
              : "border-destructive text-destructive";
          } else if (index === letters.findIndex(l => !l)) {
            className += "border-blue-500 text-blue-500";
          } else {
            className += "border-gray-500 text-gray-500";
          }

          return (
            <motion.div
              key={index}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={className}
            >
              <input
                ref={el => inputRefs.current[index] = el}
                type="text"
                value={letters[index]}
                onChange={(e) => handleLetterChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-full h-full bg-transparent text-center focus:outline-none"
                maxLength={1}
                disabled={showFeedback}
              />
            </motion.div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return <Skeleton className="h-[200px] w-full" />;
  }

  if (!words.length) {
    return (
      <Alert>
        <AlertDescription>
          Add some words to your list to start practicing!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Practice Spelling</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentWord?.definition && (
          <p className="text-sm text-muted-foreground">
            Definition: {currentWord.definition}
          </p>
        )}
        {renderWord()}
        <div className="relative flex justify-center">
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -top-8"
              >
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}