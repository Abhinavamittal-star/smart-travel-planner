import { useState, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Activity } from "@/types";
import { useTrip } from "@/context/TripContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Trash2,
  Clock,
  MapPin,
  Plane,
  Home,
  Utensils,
  Camera,
  MoreHorizontal,
  Pencil,
} from "lucide-react";

const activitySchema = z.object({
  title: z.string().min(1, "Title is required"),
  day: z.coerce.number().min(1, "Day must be at least 1"),
  time: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  category: z.enum(["accommodation", "transport", "food", "attraction", "other"]),
});

type ActivityForm = z.infer<typeof activitySchema>;

const categoryConfig = {
  accommodation: { label: "Accommodation", icon: Home, color: "bg-purple-100 text-purple-700" },
  transport: { label: "Transport", icon: Plane, color: "bg-blue-100 text-blue-700" },
  food: { label: "Food", icon: Utensils, color: "bg-orange-100 text-orange-700" },
  attraction: { label: "Attraction", icon: Camera, color: "bg-green-100 text-green-700" },
  other: { label: "Other", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600" },
};

interface ItineraryTabProps {
  tripId: string;
  activities: Activity[];
  loading: boolean;
}

export function ItineraryTab({ tripId, activities, loading }: ItineraryTabProps) {
  const { addActivity, updateActivity, deleteActivity } = useTrip();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ActivityForm>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      title: "",
      day: 1,
      time: "",
      location: "",
      notes: "",
      category: "other",
    },
  });

  const groupedActivities = useMemo(() => {
    const groups: Record<number, Activity[]> = {};
    activities.forEach((a) => {
      if (!groups[a.day]) groups[a.day] = [];
      groups[a.day].push(a);
    });
    Object.keys(groups).forEach((day) => {
      groups[Number(day)].sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    });
    return groups;
  }, [activities]);

  const sortedDays = useMemo(
    () => Object.keys(groupedActivities).map(Number).sort((a, b) => a - b),
    [groupedActivities]
  );

  const openAddDialog = useCallback(() => {
    setEditingActivity(null);
    form.reset({ title: "", day: 1, time: "", location: "", notes: "", category: "other" });
    setDialogOpen(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [form]);

  const openEditDialog = useCallback(
    (activity: Activity) => {
      setEditingActivity(activity);
      form.reset({
        title: activity.title,
        day: activity.day,
        time: activity.time || "",
        location: activity.location || "",
        notes: activity.notes || "",
        category: activity.category,
      });
      setDialogOpen(true);
    },
    [form]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteActivity(id);
      toast({ title: "Activity deleted" });
    },
    [deleteActivity, toast]
  );

  const onSubmit = useCallback(
    async (data: ActivityForm) => {
      if (editingActivity) {
        await updateActivity(editingActivity.id, data);
        toast({ title: "Activity updated" });
      } else {
        await addActivity({ ...data, tripId, time: data.time || "", location: data.location || "", notes: data.notes || "" });
        toast({ title: "Activity added" });
      }
      setDialogOpen(false);
    },
    [editingActivity, addActivity, updateActivity, tripId, toast]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-semibold text-lg">Itinerary</h3>
        <Button onClick={openAddDialog} size="sm" className="gap-2" data-testid="button-add-activity">
          <Plus className="w-4 h-4" />
          Add Activity
        </Button>
      </div>

      {sortedDays.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No activities yet</p>
          <p className="text-sm mt-1">Start building your day-by-day itinerary</p>
          <Button onClick={openAddDialog} className="mt-4 gap-2" variant="outline" data-testid="button-add-first-activity">
            <Plus className="w-4 h-4" />
            Add first activity
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDays.map((day) => (
            <div key={day}>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-primary text-primary-foreground text-sm font-semibold px-3 py-1 rounded-full">
                  Day {day}
                </div>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2">
                {groupedActivities[day].map((activity) => {
                  const cat = categoryConfig[activity.category];
                  const Icon = cat.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group"
                      data-testid={`activity-item-${activity.id}`}
                    >
                      <div className={`p-1.5 rounded-md ${cat.color} shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{activity.title}</p>
                          {activity.time && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {activity.time}
                            </span>
                          )}
                        </div>
                        {activity.location && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </p>
                        )}
                        {activity.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{activity.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openEditDialog(activity)}
                          data-testid={`button-edit-activity-${activity.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(activity.id)}
                          data-testid={`button-delete-activity-${activity.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingActivity ? "Edit Activity" : "Add Activity"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Activity Name</FormLabel>
                    <FormControl>
                      <Input {...field} ref={titleInputRef} placeholder="e.g. Visit Sensoji Temple" data-testid="input-activity-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min={1} placeholder="1" data-testid="input-activity-day" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" data-testid="input-activity-time" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-activity-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="attraction">Attraction</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Asakusa, Tokyo" data-testid="input-activity-location" />
                    </FormControl>
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
                      <Textarea {...field} placeholder="Any details..." rows={2} data-testid="input-activity-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-activity">
                  {editingActivity ? "Save Changes" : "Add Activity"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Calendar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
