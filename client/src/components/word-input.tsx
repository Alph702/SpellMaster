import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { insertWordSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

export default function WordInput() {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertWordSchema),
    defaultValues: {
      word: "",
      definition: "",
    },
  });

  const addWordMutation = useMutation({
    mutationFn: async (data: { word: string; definition: string }) => {
      const res = await apiRequest("POST", "/api/words", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/words"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      form.reset();
      setIsExpanded(false);
      toast({
        title: "Word added",
        description: "Your word has been added to your practice list.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add word",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Words</CardTitle>
      </CardHeader>
      <CardContent>
        {!isExpanded ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsExpanded(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add a new word
          </Button>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => addWordMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="word"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Word</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter a word" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="definition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Definition (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter the definition" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={addWordMutation.isPending}
                >
                  Add Word
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
