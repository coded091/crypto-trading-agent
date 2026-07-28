import { useListTokens } from "@workspace/api-client-react";
import { Link } from "wouter";
import { AlertCircle, ArrowUpRight, Clock, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function WatchlistPage() {
  const { data: tokens, isLoading, error } = useListTokens({}, {
    query: {
      queryKey: ["/api/tokens"]
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Token Watchlist</h1>
          <p className="text-muted-foreground mt-1">
            Live observation feed of tracked Solana assets.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-md shadow-sm">
          <Clock className="w-4 h-4" />
          <span className="font-mono">Auto-updating</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Asset</th>
                <th className="px-6 py-4 font-semibold text-right">Price (USD)</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Tracked Since</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 ml-auto" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              )}
              
              {!isLoading && !tokens?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Info className="w-8 h-8 opacity-50" />
                      <p>No tokens currently being tracked.</p>
                    </div>
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-destructive">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 opacity-50" />
                      <p>Failed to load watchlist data.</p>
                    </div>
                  </td>
                </tr>
              )}

              {tokens?.map((token) => (
                <tr 
                  key={`${token.chain}-${token.address}`}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {token.symbol[0]}
                      </div>
                      <div>
                        <div className="font-bold text-foreground">
                          {token.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground max-w-[120px] truncate">
                          {token.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono font-medium">
                    {token.latest_price_usd !== null && token.latest_price_usd !== undefined
                      ? `$${token.latest_price_usd < 0.01 ? token.latest_price_usd.toFixed(6) : token.latest_price_usd.toFixed(4)}`
                      : "—"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {token.latest_source ? (
                      <Badge variant="secondary" className="font-mono text-xs">
                        {token.latest_source}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-muted-foreground font-mono text-xs">
                    {token.first_seen_at 
                      ? new Date(token.first_seen_at).toLocaleDateString()
                      : "Unknown"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/tokens/${token.chain}/${token.address}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      Analyze <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
