import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-7xl mb-6">🗺️</div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-3">Page not found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          Looks like this destination does not exist on our map. Let's get you back on track.
        </p>
        <Button asChild className="gap-2">
          <Link to="/dashboard">
            <MapPin className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
