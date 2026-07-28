import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import TodayLog from "./TodayLog";
import History from "./History";
import Goals from "./Goals";
import AIInsights from "./AIInsights";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4">HealthAI LifePlanner</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Track your daily nutrition, set fitness goals, and receive AI-powered insights for your health journey.
          </p>
          <Button size="lg" className="w-full">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Render the appropriate page based on location
  const renderPage = () => {
    if (location === "/history") return <History />;
    if (location === "/goals") return <Goals />;
    if (location === "/ai-insights") return <AIInsights />;
    return <TodayLog />;
  };

  return (
    <DashboardLayout
      navItems={[
        { label: "Today's Log", href: "/" },
        { label: "History", href: "/history" },
        { label: "Goals", href: "/goals" },
        { label: "AI Insights", href: "/ai-insights" },
      ]}
    >
      {renderPage()}
    </DashboardLayout>
  );
}
