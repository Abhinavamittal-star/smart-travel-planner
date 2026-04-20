import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTrip } from "@/context/TripContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { Layout } from "@/components/Layout";
import { TripCard } from "@/components/TripCard";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Plane, DollarSign, CheckCircle, Plus } from "lucide-react";

export default function Dashboard() {
  useDocumentTitle("Dashboard");
  const { user } = useAuth();
  const { trips, expenses, loading } = useTrip();

  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = trips.filter((t) => {
      try { return new Date(t.startDate) > now && t.status !== "completed"; }
      catch { return false; }
    });
    const completed = trips.filter((t) => t.status === "completed");
    const totalBudget = trips.reduce((sum, t) => sum + t.budget, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

    return { upcoming: upcoming.length, completed: completed.length, totalBudget, totalSpent };
  }, [trips, expenses]);

  const firstName = user?.name?.split(" ")[0] || "Traveler";

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Welcome back, {firstName}
          </h1>
          <p className="text-muted-foreground mt-0.5">Here's your travel overview</p>
        </div>
        <Button asChild className="gap-2" data-testid="button-new-trip-dashboard">
          <Link to="/trips/new">
            <Plus className="w-4 h-4" />
            New Trip
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Trips"
            value={trips.length}
            icon={MapPin}
            description="all time"
          />
          <StatCard
            label="Upcoming"
            value={stats.upcoming}
            icon={Plane}
            description="trips planned"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle}
            description="trips taken"
          />
          <StatCard
            label="Total Budget"
            value={`$${(stats.totalBudget / 1000).toFixed(1)}K`}
            icon={DollarSign}
            description="across all trips"
          />
        </div>
      )}

      {/* Trips Grid */}
      <div>
        <h2 className="text-lg font-serif font-semibold mb-4 text-foreground">Your Trips</h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-52" />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-2xl">
            <div className="text-5xl mb-4">✈️</div>
            <h3 className="font-serif font-semibold text-lg mb-2">No trips yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Create your first trip and start planning your next adventure
            </p>
            <Button asChild className="gap-2" data-testid="button-create-first-trip">
              <Link to="/trips/new">
                <Plus className="w-4 h-4" />
                Create your first trip
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} expenses={expenses} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
