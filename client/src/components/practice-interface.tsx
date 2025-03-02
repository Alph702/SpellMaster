import { useState, useEffect } from "react";
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
  const [input, setInput] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
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

  // Function to render the word with highlighted letters
  const renderWord = () => {
    if (!currentWord) return null;
    const letters = currentWord.word.split('');
    const inputLetters = input.split('');

    return (
      <div className="flex justify-center space-x-1 text-2xl font-mono my-4">
        {letters.map((letter, index) => {
          let className = "px-1 rounded transition-colors duration-200 ";
          if (index < input.length) {
            className += inputLetters[index].toLowerCase() === letter.toLowerCase()
              ? "bg-primary/20 text-primary"
              : "bg-destructive/20 text-destructive";
          } else {
            className += "text-muted-foreground";
          }
          return (
            <span key={index} className={className}>
              {letter}
            </span>
          );
        })}
      </div>
    );
  };

  const handleSubmit = async () => {
    if (!currentWord) return;

    const correct = input.toLowerCase().trim() === currentWord.word.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      playCorrect();
    } else {
      playIncorrect();
    }

    await practiceMutation.mutateAsync({
      wordId: currentWord.id,
      correct,
    });

    setTimeout(() => {
      setShowFeedback(false);
      setInput("");
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 1500);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && input && !showFeedback) {
        handleSubmit();
      }
    };

    window.addEventListener("keypress", handleKeyPress);
    return () => window.removeEventListener("keypress", handleKeyPress);
  }, [input, showFeedback]);

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
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type the word..."
            disabled={showFeedback}
            className="text-center"
          />
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-2 top-1/2 -translate-y-1/2"
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
        <Button
          onClick={handleSubmit}
          disabled={!input || showFeedback}
          className="w-full"
        >
          Check
        </Button>
      </CardContent>
    </Card>
  );
}