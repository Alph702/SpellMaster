import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import WordInput from "@/components/word-input";
import PracticeInterface from "@/components/practice-interface";
import ProgressDisplay from "@/components/progress-display";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">SpellMaster</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <PracticeInterface />
            <WordInput />
          </div>
          <ProgressDisplay />
        </div>
      </main>
    </div>
  );
}
