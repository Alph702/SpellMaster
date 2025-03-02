import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, Target, Activity } from "lucide-react";

export default function ProgressDisplay() {
  const { data: progress, isLoading } = useQuery({
    queryKey: ["/api/progress"],
  });

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  const masteryPercentage = progress
    ? Math.round((progress.masteredWords / progress.totalWords) * 100) || 0
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Mastery Progress</span>
            <span className="font-medium">{masteryPercentage}%</span>
          </div>
          <Progress value={masteryPercentage} />
        </div>

        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Total Words</p>
              <p className="text-xs text-muted-foreground">
                {progress?.totalWords || 0} words added
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Mastered Words</p>
              <p className="text-xs text-muted-foreground">
                {progress?.masteredWords || 0} words mastered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">Practice Sessions</p>
              <p className="text-xs text-muted-foreground">
                {progress?.practiceCount || 0} attempts
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
