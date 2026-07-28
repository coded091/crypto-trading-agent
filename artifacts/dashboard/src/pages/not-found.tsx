import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 bg-card border border-border rounded-lg p-12">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-2">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold">404 - Signal Lost</h1>
      <p className="text-muted-foreground max-w-md">
        The terminal couldn't locate the requested asset or page. It may have been rugged or the trajectory changed.
      </p>
      <Link 
        href="/" 
        className="mt-4 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition-colors"
      >
        Return to Watchlist
      </Link>
    </div>
  );
}
