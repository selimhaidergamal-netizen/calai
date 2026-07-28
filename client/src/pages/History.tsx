import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Trash2 } from "lucide-react";

export default function History() {
  const { user } = useAuth();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);

  // Query
  const { data: entries, isLoading, refetch } = trpc.food.getHistory.useQuery(
    { startDate, endDate },
    { enabled: !!user }
  );

  // Mutation
  const deleteEntryMutation = trpc.food.delete.useMutation({
    onSuccess: () => {
      toast.success("Entry deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete entry");
    },
  });

  // Group entries by date
  const groupedEntries = entries?.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {} as Record<string, typeof entries>);

  const sortedDates = Object.keys(groupedEntries || {}).sort().reverse();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">History</h1>
        <p className="text-muted-foreground mt-2">View and manage your food entries</p>
      </div>

      {/* Date Range Filter */}
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Filter by Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Entries by Date */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        ) : !sortedDates || sortedDates.length === 0 ? (
          <Card className="shadow-elegant">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No entries found in this date range</p>
            </CardContent>
          </Card>
        ) : (
          sortedDates.map((date) => {
            const dayEntries = groupedEntries![date];
            const dailyTotal = dayEntries.reduce((sum, e) => sum + e.calories, 0);

            return (
              <Card key={date} className="shadow-elegant">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">{new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}</CardTitle>
                      <CardDescription>{date}</CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total Calories</p>
                      <p className="text-2xl font-bold text-accent">{dailyTotal}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dayEntries.map((entry) => (
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
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
