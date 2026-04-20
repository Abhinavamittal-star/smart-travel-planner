import { useState, useCallback, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Document } from "@/types";
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
import { Plus, Trash2, FileText, AlertTriangle } from "lucide-react";
import { format, isPast, differenceInDays } from "date-fns";

const documentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["passport", "visa", "insurance", "ticket", "hotel", "other"]),
  expiryDate: z.string().optional(),
  notes: z.string().optional(),
});

type DocumentForm = z.infer<typeof documentSchema>;

const typeConfig = {
  passport: { label: "Passport", color: "bg-indigo-100 text-indigo-700" },
  visa: { label: "Visa", color: "bg-blue-100 text-blue-700" },
  insurance: { label: "Insurance", color: "bg-green-100 text-green-700" },
  ticket: { label: "Ticket", color: "bg-amber-100 text-amber-700" },
  hotel: { label: "Hotel", color: "bg-purple-100 text-purple-700" },
  other: { label: "Other", color: "bg-gray-100 text-gray-600" },
};

interface DocumentsTabProps {
  tripId: string;
  documents: Document[];
  loading: boolean;
}

export function DocumentsTab({ tripId, documents, loading }: DocumentsTabProps) {
  const { addDocument, deleteDocument } = useTrip();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<DocumentForm>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: "",
      type: "other",
      expiryDate: "",
      notes: "",
    },
  });

  const sortedDocuments = useMemo(
    () => [...documents].sort((a, b) => b.createdAt - a.createdAt),
    [documents]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteDocument(id);
      toast({ title: "Document removed" });
    },
    [deleteDocument, toast]
  );

  const openDialog = useCallback(() => {
    form.reset({ title: "", type: "other", expiryDate: "", notes: "" });
    setDialogOpen(true);
    setTimeout(() => titleInputRef.current?.focus(), 100);
  }, [form]);

  const onSubmit = useCallback(
    async (data: DocumentForm) => {
      await addDocument({
        ...data,
        tripId,
        expiryDate: data.expiryDate || undefined,
        notes: data.notes || "",
      });
      toast({ title: "Document added" });
      setDialogOpen(false);
    },
    [addDocument, tripId, toast]
  );

  const getExpiryStatus = useCallback((expiryDate?: string) => {
    if (!expiryDate) return null;
    const date = new Date(expiryDate);
    if (isPast(date)) return { label: "Expired", color: "text-destructive" };
    const days = differenceInDays(date, new Date());
    if (days <= 30) return { label: `Expires in ${days}d`, color: "text-amber-600" };
    return { label: `Valid until ${format(date, "MMM d, yyyy")}`, color: "text-green-600" };
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-semibold text-lg">Documents</h3>
        <Button onClick={openDialog} size="sm" className="gap-2" data-testid="button-add-document">
          <Plus className="w-4 h-4" />
          Add Document
        </Button>
      </div>

      {sortedDocuments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No documents yet</p>
          <p className="text-sm mt-1">Keep track of your passport, visas, and tickets</p>
          <Button onClick={openDialog} variant="outline" className="mt-4 gap-2" data-testid="button-add-first-document">
            <Plus className="w-4 h-4" />
            Add document
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedDocuments.map((doc) => {
            const conf = typeConfig[doc.type];
            const expiryStatus = getExpiryStatus(doc.expiryDate);
            return (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent/30 transition-colors group"
                data-testid={`document-item-${doc.id}`}
              >
                <div className={`p-2 rounded-lg ${conf?.color}`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm">{doc.title}</p>
                    <Badge className={`text-xs ${conf?.color}`}>{conf?.label}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    {expiryStatus && (
                      <span className={`text-xs flex items-center gap-1 ${expiryStatus.color}`}>
                        {expiryStatus.color.includes("destructive") && <AlertTriangle className="w-3 h-3" />}
                        {expiryStatus.label}
                      </span>
                    )}
                    {doc.notes && (
                      <span className="text-xs text-muted-foreground">{doc.notes}</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => handleDelete(doc.id)}
                  data-testid={`button-delete-document-${doc.id}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Document Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Document</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Name</FormLabel>
                    <FormControl>
                      <Input {...field} ref={titleInputRef} placeholder="e.g. US Passport" data-testid="input-document-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-document-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="passport">Passport</SelectItem>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="ticket">Ticket</SelectItem>
                        <SelectItem value="hotel">Hotel Booking</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date (optional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" data-testid="input-document-expiry" />
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
                      <Textarea {...field} placeholder="e.g. Confirmation #ABC123" rows={2} data-testid="input-document-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-save-document">
                  Add Document
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
