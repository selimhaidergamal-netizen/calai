import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function Goals() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    targetWeight: "",
    bodyType: "",
    timelineMonths: "",
    personalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query
  const { data: goal, isLoading, refetch } = trpc.goal.get.useQuery(undefined, { enabled: !!user });

  // Mutation
  const updateGoalMutation = trpc.goal.createOrUpdate.useMutation({
    onSuccess: () => {
      toast.success("Goal saved successfully");
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save goal");
    },
  });

  // Populate form when goal loads
  useEffect(() => {
    if (goal) {
      setFormData({
        targetWeight: goal.targetWeight.toString(),
        bodyType: goal.bodyType,
        timelineMonths: goal.timelineMonths.toString(),
        personalNotes: goal.personalNotes || "",
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.targetWeight || !formData.bodyType || !formData.timelineMonths) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateGoalMutation.mutateAsync({
        targetWeight: parseInt(formData.targetWeight),
        bodyType: formData.bodyType,
        timelineMonths: parseInt(formData.timelineMonths),
        personalNotes: formData.personalNotes || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Fitness Goals</h1>
        <p className="text-muted-foreground mt-2">Set and track your health and fitness objectives</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : !goal && !isEditing ? (
        <Card className="shadow-elegant">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No fitness goal set yet</p>
            <Button onClick={() => setIsEditing(true)}>Set Your Goal</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Current Goal Display */}
          {goal && !isEditing && (
            <Card className="shadow-elegant border-accent/20 bg-accent/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-accent" />
                    <CardTitle className="text-lg">Your Current Goal</CardTitle>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Target Weight</p>
                    <p className="text-2xl font-bold text-accent">{goal.targetWeight} lbs/kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeline</p>
                    <p className="text-2xl font-bold text-accent">{goal.timelineMonths} months</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Body Type Goal</p>
                  <p className="text-lg font-semibold mt-1">{goal.bodyType}</p>
                </div>
                {goal.personalNotes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Personal Notes</p>
                    <p className="mt-1 text-sm leading-relaxed">{goal.personalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Goal Form */}
          {isEditing && (
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="text-lg">{goal ? "Update Your Goal" : "Set Your Fitness Goal"}</CardTitle>
                <CardDescription>Define your ideal body goal and timeline</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="targetWeight">Target Weight (lbs/kg) *</Label>
                      <Input
                        id="targetWeight"
                        type="number"
                        placeholder="e.g., 180"
                        value={formData.targetWeight}
                        onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <Label htmlFor="timelineMonths">Timeline (months) *</Label>
                      <Input
                        id="timelineMonths"
                        type="number"
                        placeholder="e.g., 6"
                        value={formData.timelineMonths}
                        onChange={(e) => setFormData({ ...formData, timelineMonths: e.target.value })}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bodyType">Body Type Goal *</Label>
                    <Input
                      id="bodyType"
                      placeholder="e.g., Athletic, Lean, Muscular"
                      value={formData.bodyType}
                      onChange={(e) => setFormData({ ...formData, bodyType: e.target.value })}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="personalNotes">Personal Notes</Label>
                    <Textarea
                      id="personalNotes"
                      placeholder="Share your motivation, specific areas to focus on, or any other notes..."
                      value={formData.personalNotes}
                      onChange={(e) => setFormData({ ...formData, personalNotes: e.target.value })}
                      disabled={isSubmitting}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Goal"
                      )}
                    </Button>
                    {goal && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
