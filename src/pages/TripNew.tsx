import { useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";

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

export default function TripNew() {
  useDocumentTitle("New Trip");
  const { addTrip } = useTrip();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const form = useForm<TripForm>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      title: "",
      destination: "",
      startDate: "",
      endDate: "",
      budget: 1000,
      currency: "USD",
      notes: "",
      coverEmoji: "✈️",
      status: "planning",
    },
  });

  const onSubmit = async (data: TripForm) => {
    setLoading(true);
    try {
      const trip = await addTrip({
        ...data,
        notes: data.notes || "",
        coverEmoji: data.coverEmoji || "✈️",
      });
      toast({ title: "Trip created!", description: `${trip.title} has been added.` });
      navigate(`/trips/${trip.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Button variant="ghost" asChild className="gap-2 mb-6 -ml-2" data-testid="button-back">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
        </Button>

        <h1 className="text-2xl font-serif font-bold mb-6">Plan a new trip</h1>

        <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Emoji picker */}
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
                            data-testid={`emoji-option-${emoji}`}
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
                        <Input {...field} type="number" min={0} placeholder="5000" data-testid="input-budget" />
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
                  <Link to="/dashboard">Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading} data-testid="button-create-trip">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? "Creating..." : "Create Trip"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Layout>
  );
}
