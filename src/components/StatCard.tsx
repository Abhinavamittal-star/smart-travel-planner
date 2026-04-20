import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  accentColor?: string;
}

export function StatCard({ label, value, icon: Icon, description, accentColor = "text-primary" }: StatCardProps) {
  return (
    <Card className="border border-border">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">{label}</p>
            <p className="text-3xl font-serif font-bold mt-1 text-foreground" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div className={`p-2.5 rounded-lg bg-primary/10 ${accentColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
