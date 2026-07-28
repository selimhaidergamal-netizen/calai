import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

export default function TodayLog() {
  const { user } = useAuth();
  const [today] = useState(() => new Date().toISOString().split("T")[0]);
  const [formData, setFormData] = useState({
    foodName: "",
    calories: "",
    mealType: "breakfast" as const,
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: dailyLog, isLoading, refetch } = trpc.food.getDailyLog.useQuery(
    { date: today },
    { enabled: !!user }
  );

  // Mutations
  const createEntryMutation = trpc.food.create.useMutation({
    onSuccess: () => {
      toast.success("Food entry added successfully");
      setFormData({ foodName: "", calories: "", mealType: "breakfast", notes: "" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add food entry");
    },
  });

  const deleteEntryMutation = trpc.food.delete.useMutation({
    onSuccess: () => {
      toast.success("Entry deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete entry");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.foodName || !formData.calories) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createEntryMutation.mutateAsync({
        foodName: formData.foodName,
        calories: parseInt(formData.calories),
        mealType: formData.mealType,
        date: today,
        notes: formData.notes || undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalCalories = dailyLog?.summary?.totalCalories || 0;
  const entryCount = dailyLog?.summary?.entryCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Today's Log</h1>
        <p className="text-muted-foreground mt-2">{today}</p>
      </div>

      {/* Daily Summary */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Daily Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-accent/5 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Total Calories</p>
              <p className="text-3xl font-bold text-accent mt-1">{totalCalories}</p>
            </div>
            <div className="p-4 bg-accent/5 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground">Entries</p>
              <p className="text-3xl font-bold text-accent mt-1">{entryCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Food Entry Form */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Add Food Entry</CardTitle>
          <CardDescription>Log your meal to track daily nutrition</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="foodName">Food Name *</Label>
              <Input
                id="foodName"
                placeholder="e.g., Grilled Chicken Breast"
                value={formData.foodName}
                onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Calories *</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="e.g., 250"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Label htmlFor="mealType">Meal Type *</Label>
                <Select value={formData.mealType} onValueChange={(value: any) => setFormData({ ...formData, mealType: value })}>
                  <SelectTrigger id="mealType" disabled={isSubmitting}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this meal..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Entry"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Today's Entries */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Today's Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
            </div>
          ) : !dailyLog?.entries || dailyLog.entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No entries yet. Add your first meal above!</p>
          ) : (
            <div className="space-y-2">
              {dailyLog.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="flex-1">
                    <p className="font-medium">{entry.foodName}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.calories} cal • {entry.mealType}
                      {entry.notes && ` • ${entry.notes}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntryMutation.mutate({ id: entry.id })}
                    disabled={deleteEntryMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
