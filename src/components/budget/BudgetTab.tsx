import { useState, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Expense, Trip } from "@/types";
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
import { Plus, Trash2, TrendingUp } from "lucide-react";
import { format } from "date-fns";

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  category: z.enum(["accommodation", "transport", "food", "activities", "shopping", "other"]),
  date: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

const categoryConfig = {
  accommodation: { label: "Accommodation", color: "bg-purple-100 text-purple-700" },
  transport: { label: "Transport", color: "bg-blue-100 text-blue-700" },
  food: { label: "Food", color: "bg-orange-100 text-orange-700" },
  activities: { label: "Activities", color: "bg-green-100 text-green-700" },
  shopping: { label: "Shopping", color: "bg-pink-100 text-pink-700" },
  other: { label: "Other", color: "bg-gray-100 text-gray-600" },
};

interface BudgetTabProps {
  trip: Trip;
  expenses: Expense[];
  loading: boolean;
}

export function BudgetTab({ trip, expenses, loading }: BudgetTabProps) {
  const { addExpense, deleteExpense } = useTrip();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: 0,
      category: "other",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const totalSpent = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
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

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return totals;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (filterCategory === "all") return [...expenses].sort((a, b) => b.createdAt - a.createdAt);
    return expenses.filter((e) => e.category === filterCategory).sort((a, b) => b.createdAt - a.createdAt);
  }, [expenses, filterCategory]);

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteExpense(id);
      toast({ title: "Expense deleted" });
    },
    [deleteExpense, toast]
  );

  const openDialog = useCallback(() => {
    form.reset({
      title: "",
      amount: 0,
      category: "other",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    });
    setDialogOpen(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [form]);

  const onSubmit = useCallback(
    async (data: ExpenseForm) => {
      await addExpense({ ...data, tripId: trip.id, notes: data.notes || "" });
      toast({ title: "Expense added" });
      setDialogOpen(false);
    },
    [addExpense, trip.id, toast]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const remaining = trip.budget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Budget Summary */}
      <div className="p-5 rounded-xl border border-border bg-card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Budget</p>
            <p className="text-3xl font-serif font-bold text-foreground" data-testid="text-total-budget">
              {trip.budget.toLocaleString()} {trip.currency}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground font-medium">Remaining</p>
            <p className={`text-2xl font-serif font-bold ${remaining < 0 ? "text-destructive" : "text-primary"}`} data-testid="text-remaining-budget">
              {remaining.toLocaleString()} {trip.currency}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Spent: {totalSpent.toLocaleString()} {trip.currency}</span>
            <span>{budgetPercent.toFixed(0)}%</span>
          </div>
          <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${progressColor}`}
              style={{ width: `${budgetPercent}%` }}
              data-testid="progress-total-budget"
            />
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(categoryTotals).map(([cat, total]) => {
            const conf = categoryConfig[cat as keyof typeof categoryConfig];
            return (
              <div key={cat} className="p-3 rounded-lg border border-border bg-card">
                <Badge className={`text-xs mb-1 ${conf?.color}`}>{conf?.label}</Badge>
                <p className="font-semibold text-sm" data-testid={`text-category-total-${cat}`}>
                  {total.toLocaleString()} {trip.currency}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Expenses list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif font-semibold text-lg">Expenses</h3>
          <div className="flex items-center gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-36 h-8 text-xs" data-testid="select-filter-category">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="accommodation">Accommodation</SelectItem>
                <SelectItem value="transport">Transport</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={openDialog} size="sm" className="gap-2" data-testid="button-add-expense">
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No expenses yet</p>
            <p className="text-sm mt-1">Track your spending as you go</p>
            <Button onClick={openDialog} variant="outline" className="mt-4 gap-2" data-testid="button-add-first-expense">
              <Plus className="w-4 h-4" />
              Add expense
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((expense) => {
              const conf = categoryConfig[expense.category];
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group"
                  data-testid={`expense-item-${expense.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{expense.title}</p>
                      <Badge className={`text-xs ${conf?.color}`}>{conf?.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {expense.date ? format(new Date(expense.date), "MMM d, yyyy") : ""}
                      {expense.notes ? ` • ${expense.notes}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm" data-testid={`text-expense-amount-${expense.id}`}>
                      {expense.amount.toLocaleString()} {trip.currency}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => handleDelete(expense.id)}
                      data-testid={`button-delete-expense-${expense.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} ref={titleInputRef} placeholder="e.g. Hotel Gracery" data-testid="input-expense-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ({trip.currency})</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min={0} step="0.01" placeholder="0" data-testid="input-expense-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" data-testid="input-expense-date" />
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
                        <SelectTrigger data-testid="select-expense-category">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="transport">Transport</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="activities">Activities</SelectItem>
                        <SelectItem value="shopping">Shopping</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                      <Textarea {...field} placeholder="Optional notes..." rows={2} data-testid="input-expense-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-expense">
                  Add Expense
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
