import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Trip, Expense } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  planning: { label: "Planning", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  active: { label: "Active", className: "bg-green-100 text-green-700 hover:bg-green-100" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-600 hover:bg-gray-100" },
};

interface TripCardProps {
  trip: Trip;
  expenses: Expense[];
}

export function TripCard({ trip, expenses }: TripCardProps) {
  const tripExpenses = useMemo(
    () => expenses.filter((e) => e.tripId === trip.id),
    [expenses, trip.id]
  );

  const totalSpent = useMemo(
    () => tripExpenses.reduce((sum, e) => sum + e.amount, 0),
    [tripExpenses]
  );

  const budgetPercent = useMemo(
    () => Math.min((totalSpent / trip.budget) * 100, 100),
    [totalSpent, trip.budget]
  );

  const progressColor = useMemo(() => {
    if (budgetPercent >= 90) return "bg-red-500";
    if (budgetPercent >= 70) return "bg-amber-500";
    return "bg-primary";
  }, [budgetPercent]);

  const formattedStart = useMemo(() => {
    try { return format(new Date(trip.startDate), "MMM d"); } catch { return trip.startDate; }
  }, [trip.startDate]);

  const formattedEnd = useMemo(() => {
    try { return format(new Date(trip.endDate), "MMM d, yyyy"); } catch { return trip.endDate; }
  }, [trip.endDate]);

  const status = statusConfig[trip.status] || statusConfig.planning;

  return (
    <Link to={`/trips/${trip.id}`} data-testid={`card-trip-${trip.id}`}>
      <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden border border-border">
        <CardContent className="p-0">
          {/* Card header with cover */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 px-5 pt-5 pb-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-4xl leading-none" role="img" aria-label="trip cover">
                {trip.coverEmoji}
              </span>
              <Badge className={`text-xs font-medium ${status.className}`}>
                {status.label}
              </Badge>
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground leading-tight">
              {trip.title}
            </h3>
            <div className="flex items-center gap-1 text-muted-foreground mt-1 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{trip.destination}</span>
            </div>
          </div>

          {/* Card body */}
          <div className="px-5 py-4 space-y-3">
            {/* Dates */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span data-testid={`text-trip-dates-${trip.id}`}>
                {formattedStart} – {formattedEnd}
              </span>
            </div>

            {/* Budget progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Budget
                </span>
                <span className="font-medium" data-testid={`text-budget-${trip.id}`}>
                  {totalSpent.toLocaleString()} / {trip.budget.toLocaleString()} {trip.currency}
                </span>
              </div>
              <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${budgetPercent}%` }}
                  data-testid={`progress-budget-${trip.id}`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
