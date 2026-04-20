import { useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTrip } from "@/context/TripContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { ItineraryTab } from "@/components/itinerary/ItineraryTab";
import { BudgetTab } from "@/components/budget/BudgetTab";
import { DocumentsTab } from "@/components/documents/DocumentsTab";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  MapPin,
  Calendar,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

const statusConfig = {
  planning: { label: "Planning", className: "bg-blue-100 text-blue-700" },
  active: { label: "Active", className: "bg-green-100 text-green-700" },
  completed: { label: "Completed", className: "bg-gray-100 text-gray-600" },
};

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const { trips, activities, expenses, documents, loading, deleteTrip } = useTrip();
  const navigate = useNavigate();
  const { toast } = useToast();

  const trip = useMemo(() => trips.find((t) => t.id === id), [trips, id]);

  useDocumentTitle(trip?.title || "Trip");

  const tripActivities = useMemo(
    () => activities.filter((a) => a.tripId === id),
    [activities, id]
  );
  const tripExpenses = useMemo(
    () => expenses.filter((e) => e.tripId === id),
    [expenses, id]
  );
  const tripDocuments = useMemo(
    () => documents.filter((d) => d.tripId === id),
    [documents, id]
  );

  const totalSpent = useMemo(
    () => tripExpenses.reduce((sum, e) => sum + e.amount, 0),
    [tripExpenses]
  );

  const handleDelete = async () => {
    if (!id) return;
    await deleteTrip(id);
    toast({ title: "Trip deleted" });
    navigate("/dashboard");
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Trip not found.</p>
          <Button asChild variant="outline">
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const status = statusConfig[trip.status] || statusConfig.planning;

  const formattedStart = (() => {
    try { return format(new Date(trip.startDate), "MMM d, yyyy"); }
    catch { return trip.startDate; }
  })();

  const formattedEnd = (() => {
    try { return format(new Date(trip.endDate), "MMM d, yyyy"); }
    catch { return trip.endDate; }
  })();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Button variant="ghost" asChild className="gap-2 mb-4 -ml-2" data-testid="button-back">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </Button>

        {/* Trip header */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl border border-border p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <span className="text-5xl" role="img" aria-label={trip.title}>
              {trip.coverEmoji}
            </span>
            <div className="flex items-center gap-2">
              <Badge className={`${status.className}`}>{status.label}</Badge>
              <Button variant="outline" size="sm" asChild className="gap-2" data-testid="button-edit-trip">
                <Link to={`/trips/${trip.id}/edit`}>
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" data-testid="button-delete-trip">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this trip?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete "{trip.title}" and all its activities, expenses, and documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <h1 className="text-2xl font-serif font-bold text-foreground">{trip.title}</h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formattedStart} – {formattedEnd}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {totalSpent.toLocaleString()} / {trip.budget.toLocaleString()} {trip.currency}
            </span>
          </div>

          {trip.notes && (
            <p className="text-sm text-muted-foreground mt-3 border-t border-border/60 pt-3">
              {trip.notes}
            </p>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="itinerary">
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="itinerary" className="flex-1 sm:flex-none gap-2" data-testid="tab-itinerary">
              Itinerary
              {tripActivities.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary rounded-full px-2">{tripActivities.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex-1 sm:flex-none gap-2" data-testid="tab-budget">
              Budget
              {tripExpenses.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary rounded-full px-2">{tripExpenses.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 sm:flex-none gap-2" data-testid="tab-documents">
              Documents
              {tripDocuments.length > 0 && (
                <span className="ml-1 text-xs bg-primary/20 text-primary rounded-full px-2">{tripDocuments.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="itinerary">
            <ItineraryTab tripId={trip.id} activities={tripActivities} loading={false} />
          </TabsContent>
          <TabsContent value="budget">
            <BudgetTab trip={trip} expenses={tripExpenses} loading={false} />
          </TabsContent>
          <TabsContent value="documents">
            <DocumentsTab tripId={trip.id} documents={tripDocuments} loading={false} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
