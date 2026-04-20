import { useMemo, useRef, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTrip } from "@/context/TripContext";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";

const tripSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  destination: z.string().min(2, "Destination is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.coerce.number().positive("Budget must be a positive number"),
  currency: z.string().min(1, "Currency is required"),
  notes: z.string().optional(),
  coverEmoji: z.string().optional(),
  status: z.enum(["planning", "active", "completed"]),
});

type TripForm = z.infer<typeof tripSchema>;

const COMMON_EMOJIS = ["✈️", "🗺️", "🏖️", "🏔️", "🗼", "🗽", "🏯", "🌴", "🎭", "🍜", "🎒", "🌊"];
const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "SGD", "MXN", "BRL"];

export default function TripEdit() {
  const { id } = useParams<{ id: string }>();
  const { trips, updateTrip, loading } = useTrip();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const trip = useMemo(() => trips.find((t) => t.id === id), [trips, id]);

  useDocumentTitle(trip ? `Edit: ${trip.title}` : "Edit Trip");

  const form = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: trip?.title || "",
      destination: trip?.destination || "",
      startDate: trip?.startDate || "",
      endDate: trip?.endDate || "",
      budget: trip?.budget || 1000,
      currency: trip?.currency || "USD",
      notes: trip?.notes || "",
      coverEmoji: trip?.coverEmoji || "✈️",
      status: trip?.status || "planning",
    },
  });

  useEffect(() => {
    if (trip) {
      form.reset({
        title: trip.title,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        budget: trip.budget,
        currency: trip.currency,
        notes: trip.notes,
        coverEmoji: trip.coverEmoji,
        status: trip.status,
      });
    }
    titleInputRef.current?.focus();
  }, [trip, form]);

  const onSubmit = async (data: TripForm) => {
    if (!id) return;
    setSaving(true);
    try {
      await updateTrip(id, {
        ...data,
        notes: data.notes || "",
        coverEmoji: data.coverEmoji || "✈️",
      });
      toast({ title: "Trip updated!" });
      navigate(`/trips/${id}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto space-y-4">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">Trip not found.</p>
          <Button asChild variant="outline"><Link to="/dashboard">Back</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" asChild className="gap-2 mb-6 -ml-2" data-testid="button-back">
          <Link to={`/trips/${id}`}>
            <ArrowLeft className="w-4 h-4" />
            Back to trip
          </Link>
        </Button>

        <h1 className="text-2xl font-serif font-bold mb-6">Edit trip</h1>

        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="coverEmoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Emoji</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => field.onChange(emoji)}
                            className={`text-2xl w-11 h-11 rounded-lg border-2 transition-colors ${
                              field.value === emoji
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip Name</FormLabel>
                    <FormControl>
                      <Input {...field} ref={titleInputRef} placeholder="e.g. Tokyo Adventure" data-testid="input-trip-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Tokyo, Japan" data-testid="input-trip-destination" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min={0} data-testid="input-budget" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any notes about this trip..." rows={3} data-testid="input-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" asChild>
                  <Link to={`/trips/${id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={saving} data-testid="button-save-trip">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
