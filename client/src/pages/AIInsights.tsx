import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Streamdown } from "streamdown";

export default function AIInsights() {
  const { user } = useAuth();
  const [daysBack, setDaysBack] = useState(7);

  // Queries
  const { data: latestAnalysis, isLoading: isLoadingLatest, refetch: refetchLatest } = trpc.ai.getLatest.useQuery(undefined, { enabled: !!user });

  // Mutations
  const generateInsightsMutation = trpc.ai.generateInsights.useMutation({
    onSuccess: () => {
      toast.success("Insights generated successfully");
      refetchLatest();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate insights");
    },
  });

  const handleGenerateInsights = async () => {
    try {
      await generateInsightsMutation.mutateAsync({ daysBack });
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground mt-2">Get personalized health analysis powered by Gemini</p>
      </div>

      {/* Generate Insights Card */}
      <Card className="shadow-elegant border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <CardTitle className="text-lg">Generate New Insights</CardTitle>
          </div>
          <CardDescription>Analyze your recent nutrition and fitness data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Analyze last</label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="range"
                min="1"
                max="30"
                value={daysBack}
                onChange={(e) => setDaysBack(parseInt(e.target.value))}
                className="flex-1"
                disabled={generateInsightsMutation.isPending}
              />
              <span className="text-sm font-semibold text-accent w-12">{daysBack} days</span>
            </div>
          </div>

          <Button
            onClick={handleGenerateInsights}
            disabled={generateInsightsMutation.isPending}
            className="w-full"
          >
            {generateInsightsMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Insights
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Latest Analysis Display */}
      {isLoadingLatest ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : !latestAnalysis ? (
        <Card className="shadow-elegant">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No insights generated yet</p>
            <p className="text-sm text-muted-foreground">Generate your first analysis using the button above</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Latest Analysis</CardTitle>
                <CardDescription>
                  Generated on {new Date(latestAnalysis.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateInsights}
                disabled={generateInsightsMutation.isPending}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <Streamdown>{latestAnalysis.analysis}</Streamdown>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="shadow-elegant bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            Our AI analyzes your food entries and fitness goals to provide personalized recommendations. The analysis includes:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your current eating patterns and trends</li>
            <li>Progress toward your fitness goals</li>
            <li>Specific, actionable recommendations</li>
            <li>Motivational insights for your journey</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
