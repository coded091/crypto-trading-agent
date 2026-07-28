import { useListSocialMentions } from "@workspace/api-client-react";
import { ExternalLink, MessageCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function SocialFeedPage() {
  const { data: mentions, isLoading, error } = useListSocialMentions(
    { limit: 50 },
    { query: { queryKey: ["/api/social/mentions"] } }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Social Signals</h1>
          <p className="text-muted-foreground mt-1">
            Live stream of mentions across social platforms.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border p-5 rounded-lg space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        ))}

        {!isLoading && error && (
          <div className="col-span-full py-12 text-center text-destructive bg-card border border-border rounded-lg">
            <AlertTriangle className="w-8 h-8 opacity-50 mx-auto mb-2" />
            <p>Failed to load social signals.</p>
          </div>
        )}

        {mentions?.map((mention, idx) => (
          <div 
            key={`${mention.created_at}-${idx}`}
            className="bg-card border border-border rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="uppercase font-mono text-[10px]">
                  {mention.platform}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(mention.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold text-foreground leading-snug line-clamp-3 mb-4">
                {mention.title}
              </h3>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                {mention.score !== null && mention.score !== undefined && (
                  <div className="flex items-center gap-1 text-primary">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{mention.score}</span>
                  </div>
                )}
                {mention.num_comments !== null && mention.num_comments !== undefined && (
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{mention.num_comments}</span>
                  </div>
                )}
              </div>
              
              {mention.url && (
                <a 
                  href={mention.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 text-xs font-medium"
                >
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
