import { useParams, Link } from "wouter";
import { 
  useGetTokenHistory, getGetTokenHistoryQueryKey,
  useGetTokenSafety, getGetTokenSafetyQueryKey,
  useGetTokenTechnical, getGetTokenTechnicalQueryKey,
  useGetTokenRecommendation, getGetTokenRecommendationQueryKey 
} from "@workspace/api-client-react";
import { 
  ArrowLeft, BrainCircuit, ShieldAlert, Activity, 
  TrendingUp, TrendingDown, AlertTriangle, ShieldCheck, 
  BarChart3, Scale, Skull
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

function ActionBadge({ action, confidence }: { action?: string, confidence?: number }) {
  if (!action) return null;
  const upperAction = action.toUpperCase();
  
  let colorClass = "bg-muted text-muted-foreground border-muted-foreground/30";
  let Icon = Activity;

  if (action === "buy") {
    colorClass = "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30";
    Icon = TrendingUp;
  } else if (action === "sell") {
    colorClass = "bg-destructive/10 text-destructive border-destructive/30";
    Icon = TrendingDown;
  } else if (action === "hold") {
    colorClass = "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30";
    Icon = Scale;
  } else if (action === "ignore") {
    colorClass = "bg-muted text-muted-foreground border-border";
    Icon = Skull;
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border ${colorClass} font-mono text-sm font-bold`}>
      <Icon className="w-4 h-4" />
      <span>{upperAction}</span>
      {confidence !== undefined && (
        <span className="opacity-70 ml-2 border-l border-current pl-2">
          {confidence}% CONF
        </span>
      )}
    </div>
  );
}

function RiskDisplay({ score }: { score?: number }) {
  if (score === undefined) return <Skeleton className="h-8 w-16" />;
  
  let color = "text-[#10B981]";
  if (score > 40) color = "text-[#F59E0B]";
  if (score > 75) color = "text-destructive";

  return (
    <div className={`text-4xl font-mono font-bold ${color}`}>
      {score}<span className="text-xl opacity-50">/100</span>
    </div>
  );
}

export default function TokenDetailPage() {
  const { chain, address } = useParams<{ chain: string, address: string }>();
  
  const safeChain = chain || "";
  const safeAddress = address || "";
  const enabled = !!chain && !!address;

  const { data: history, isLoading: historyLoading } = useGetTokenHistory(
    safeChain, safeAddress, { limit: 100 }, 
    { query: { enabled, queryKey: getGetTokenHistoryQueryKey(safeChain, safeAddress, { limit: 100 }) } }
  );

  const { data: safety, isLoading: safetyLoading } = useGetTokenSafety(
    safeChain, safeAddress, 
    { query: { enabled, queryKey: getGetTokenSafetyQueryKey(safeChain, safeAddress) } }
  );

  const { data: technical, isLoading: technicalLoading } = useGetTokenTechnical(
    safeChain, safeAddress, 
    { query: { enabled, queryKey: getGetTokenTechnicalQueryKey(safeChain, safeAddress) } }
  );

  const { data: rec, isLoading: recLoading } = useGetTokenRecommendation(
    safeChain, safeAddress, 
    { query: { enabled, queryKey: getGetTokenRecommendationQueryKey(safeChain, safeAddress) } }
  );

  // Format chart data
  const chartData = history?.map(h => ({
    time: new Date(h.collected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    price: h.price_usd
  })).reverse() || [];

  const currentPrice = history?.[0]?.price_usd;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors w-fit">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Watchlist
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Badge variant="outline" className="font-mono">{safeChain.toUpperCase()}</Badge>
              <code className="text-xs text-muted-foreground">{safeAddress}</code>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Token Analysis</h1>
          </div>
          {currentPrice !== undefined && (
            <div className="text-right">
              <div className="text-sm text-muted-foreground font-mono uppercase tracking-wider mb-1">Latest Price</div>
              <div className="text-3xl font-mono font-bold text-primary">
                ${currentPrice < 0.01 ? currentPrice.toFixed(6) : currentPrice.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart Panel */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Price Action</h2>
            </div>
            <div className="h-[300px] w-full">
              {historyLoading ? (
                <Skeleton className="w-full h-full" />
              ) : chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickMargin={10}
                      minTickGap={30}
                    />
                    <YAxis 
                      domain={['auto', 'auto']}
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickFormatter={(val) => `$${val}`}
                      width={80}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '4px' }}
                      itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground border border-dashed rounded bg-muted/20">
                  No historical data available
                </div>
              )}
            </div>
          </div>

          {/* AI Brain Panel */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start justify-between gap-4 mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Claude Intelligence</h2>
                  <div className="text-xs font-mono text-primary mt-1">
                    {recLoading ? "ANALYZING..." : (rec?.model_used || "SYSTEM_READY")}
                  </div>
                </div>
              </div>
              {!recLoading && rec && (
                <ActionBadge action={rec.action} confidence={rec.confidence} />
              )}
            </div>

            {recLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : rec ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Why Interesting</h3>
                    <p className="text-sm text-foreground leading-relaxed">{rec.why_interesting}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Why Now</h3>
                    <p className="text-sm text-foreground leading-relaxed">{rec.why_now}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-card/50 border border-border p-3 rounded">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#10B981] mb-1">Upside Case</h3>
                    <p className="text-sm">{rec.upside}</p>
                  </div>
                  <div className="bg-card/50 border border-border p-3 rounded">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-destructive mb-1">Downside Risk</h3>
                    <p className="text-sm">{rec.downside}</p>
                  </div>
                  <div className="bg-card/50 border border-border p-3 rounded">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Invalidation</h3>
                    <p className="text-sm">{rec.invalidation}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Recommendation unavailable.</div>
            )}
          </div>
          
        </div>

        {/* Right Column - Sidebar Panels */}
        <div className="space-y-6">
          
          {/* Safety Panel */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-foreground" />
                <h2 className="text-lg font-bold">Risk Profile</h2>
              </div>
              <RiskDisplay score={safety?.risk_score} />
            </div>

            {safetyLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : safety ? (
              <div className="space-y-4">
                {safety.flags?.length > 0 && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded p-3 mb-4">
                    <div className="flex items-center gap-2 text-destructive font-bold text-xs uppercase mb-2">
                      <AlertTriangle className="w-4 h-4" /> Critical Flags
                    </div>
                    <ul className="space-y-1">
                      {safety.flags.map((flag, i) => (
                        <li key={i} className="text-sm text-destructive/90 flex items-start gap-2">
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-destructive flex-shrink-0" />
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground">Mint Authority</span>
                    {safety.mint_authority_active 
                      ? <Badge variant="destructive">Active</Badge> 
                      : <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30"><ShieldCheck className="w-3 h-3 mr-1"/> Revoked</Badge>}
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                    <span className="text-muted-foreground">Freeze Authority</span>
                    {safety.freeze_authority_active 
                      ? <Badge variant="destructive">Active</Badge> 
                      : <Badge variant="outline" className="text-[#10B981] border-[#10B981]/30"><ShieldCheck className="w-3 h-3 mr-1"/> Revoked</Badge>}
                  </div>
                  <div className="flex justify-between items-center py-2 text-sm">
                    <span className="text-muted-foreground">Top 10 Holders</span>
                    <span className="font-mono font-medium">
                      {safety.holder_concentration?.top_10_pct !== undefined && safety.holder_concentration.top_10_pct !== null
                        ? `${safety.holder_concentration.top_10_pct.toFixed(1)}%` 
                        : "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
               <div className="text-sm text-muted-foreground">Risk data unavailable.</div>
            )}
          </div>

          {/* Technicals Panel */}
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-foreground" />
              <h2 className="text-lg font-bold">Technicals</h2>
            </div>
            
            {technicalLoading ? (
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : technical ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded border border-border/50 flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase mb-1">RSI (14)</span>
                  <span className={`text-xl font-mono font-bold ${
                    technical.rsi_14 && technical.rsi_14 > 70 ? 'text-destructive' : 
                    technical.rsi_14 && technical.rsi_14 < 30 ? 'text-[#10B981]' : ''
                  }`}>
                    {technical.rsi_14?.toFixed(2) ?? '—'}
                  </span>
                </div>
                <div className="p-3 bg-muted/30 rounded border border-border/50 flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase mb-1">MACD</span>
                  <span className="text-xl font-mono font-bold">
                    {technical.macd?.toFixed(6) ?? '—'}
                  </span>
                </div>
                <div className="p-3 bg-muted/30 rounded border border-border/50 flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase mb-1">Momentum (10)</span>
                  <span className={`text-xl font-mono font-bold ${
                    technical.momentum_10 && technical.momentum_10 > 0 ? 'text-[#10B981]' : 
                    technical.momentum_10 && technical.momentum_10 < 0 ? 'text-destructive' : ''
                  }`}>
                    {technical.momentum_10?.toFixed(4) ?? '—'}
                  </span>
                </div>
                <div className="p-3 bg-muted/30 rounded border border-border/50 flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase mb-1">Volatility (20)</span>
                  <span className="text-xl font-mono font-bold">
                    {technical.volatility_20?.toFixed(4) ?? '—'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Technical data unavailable.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
