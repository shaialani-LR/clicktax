import { useState, useMemo, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Bug, Calculator, ArrowRight, ChevronDown, Info, CheckCircle, XCircle, Zap, BookOpen, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ComplexityGradeBadge } from "@/components/ComplexityGradeBadge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

const POPULAR_PRODUCTS = [
  { name: 'Salesforce', url: 'https://salesforce.com', icon: '☁️' },
  { name: 'HubSpot', url: 'https://hubspot.com', icon: '🧲' },
  { name: 'Zendesk', url: 'https://zendesk.com', icon: '🎟️' },
  { name: 'Jira', url: 'https://atlassian.com/jira', icon: '📊' },
  { name: 'Confluence', url: 'https://atlassian.com/confluence', icon: '📚' },
  { name: 'Monday.com', url: 'https://monday.com', icon: '📅' },
  { name: 'Asana', url: 'https://asana.com', icon: '✅' },
  { name: 'ClickUp', url: 'https://clickup.com', icon: '🎯' },
  { name: 'Notion', url: 'https://notion.so', icon: '📝' },
  { name: 'Airtable', url: 'https://airtable.com', icon: '📋' },
  { name: 'Figma', url: 'https://figma.com', icon: '🎨' },
  { name: 'Linear', url: 'https://linear.app', icon: '⚡' },
  { name: 'Slack', url: 'https://slack.com', icon: '💬' },
  { name: 'Intercom', url: 'https://intercom.com', icon: '🗨️' },
  { name: 'Stripe', url: 'https://stripe.com', icon: '💳' },
  { name: 'Shopify', url: 'https://shopify.com', icon: '🛒' },
  { name: 'Webflow', url: 'https://webflow.com', icon: '🌐' },
  { name: 'Mailchimp', url: 'https://mailchimp.com', icon: '📧' },
  { name: 'Calendly', url: 'https://calendly.com', icon: '📆' },
  { name: 'Zoom', url: 'https://zoom.us', icon: '📹' },
  { name: 'Miro', url: 'https://miro.com', icon: '🖼️' },
  { name: 'Loom', url: 'https://loom.com', icon: '🎥' },
  { name: 'Dropbox', url: 'https://dropbox.com', icon: '📦' },
  { name: 'Trello', url: 'https://trello.com', icon: '📌' },
  { name: 'ServiceNow', url: 'https://servicenow.com', icon: '⚙️' },
  { name: 'Workday', url: 'https://workday.com', icon: '👔' },
  { name: 'Oracle', url: 'https://oracle.com', icon: '🔴' },
  { name: 'SAP', url: 'https://sap.com', icon: '🔷' },
  { name: 'NetSuite', url: 'https://netsuite.com', icon: '💼' },
  { name: 'Dynamics 365', url: 'https://dynamics.microsoft.com', icon: '🔲' },
];

const extractDomainName = (input: string): string => {
  try {
    const cleaned = input.replace(/^https?:\/\//, '').replace(/^www\./, '');
    const domain = cleaned.split('/')[0];
    const name = domain.split('.')[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return input;
  }
};

const looksLikeUrl = (input: string): boolean => {
  const cleaned = input.trim().toLowerCase();
  return cleaned.includes('.') && !cleaned.includes(' ');
};

interface DebugData {
  url: string;
  domain: string;
  productName: string;
  knownBaseline: {
    clickTaxBase: number;
    cognitiveBase: number;
    hasTemplates: boolean;
    isComplex: boolean;
  } | null;
  hasTemplates: boolean;
  navItemCount: number;
  navDepth: number;
  docsFound: number;
  isEnterpriseProduct: boolean;
  isKnownComplexProduct: boolean;
  navComplexityCount: number;
  navSimplicityCount: number;
  cogComplexityCount: number;
  cogSimplicityCount: number;
  isHighFriction: boolean;
  isMediumFriction: boolean;
  documentationScore: number;
  reviewSentiment: { positive: number; neutral: number; negative: number };
  clickTaxScore: number;
  totalCognitiveLoad: number;
  overallScore: number;
  setupMinutes: number;
  timeToValueEstimate: string;
}

export default function Debugger() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    const searchTerm = url.toLowerCase().replace('https://', '').replace('http://', '').replace('www.', '').trim();
    
    const filtered = searchTerm 
      ? POPULAR_PRODUCTS.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.url.toLowerCase().includes(searchTerm)
        ).slice(0, 6)
      : POPULAR_PRODUCTS.slice(0, 8);
    
    if (searchTerm) {
      const exactMatch = POPULAR_PRODUCTS.some(p => 
        p.name.toLowerCase() === searchTerm
      );
      
      if (!exactMatch) {
        const customUrl = looksLikeUrl(searchTerm) 
          ? (searchTerm.startsWith('http') ? searchTerm : `https://${searchTerm}`)
          : `https://${searchTerm}.com`;
        
        return [
          { 
            name: extractDomainName(customUrl), 
            url: customUrl, 
            icon: '🌐', 
            isCustom: true,
            description: `Analyze ${customUrl.replace('https://', '')}`
          },
          ...filtered
        ];
      }
    }
    
    return filtered;
  }, [url]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runDebugAnalysis = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    
    setLoading(true);
    setError(null);
    setDebugData(null);
    setShowSuggestions(false);

    let formattedUrl = targetUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const { data, error: invokeError } = await supabase.functions.invoke('analyze-product', {
        body: { url: formattedUrl, debug: true },
      });

      if (invokeError) throw invokeError;
      if (!data.success) throw new Error(data.error || 'Analysis failed');
      
      setDebugData(data.debugInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (product: { name: string; url: string }) => {
    setUrl(product.url);
    runDebugAnalysis(product.url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runDebugAnalysis(url);
  };

  const getScoreExplanation = (score: number): { text: string; color: string } => {
    if (score >= 80) return { text: "Excellent - minimal friction, quick adoption", color: "text-emerald-500" };
    if (score >= 60) return { text: "Good - reasonable learning curve", color: "text-green-500" };
    if (score >= 40) return { text: "Moderate - expect some training time", color: "text-yellow-500" };
    if (score >= 20) return { text: "Poor - significant implementation effort", color: "text-orange-500" };
    return { text: "Very Poor - extensive effort required", color: "text-destructive" };
  };

  const getClickTaxExplanation = (score: number): string => {
    if (score >= 80) return "Very high navigation complexity. Users spend significant time finding features.";
    if (score >= 60) return "Elevated friction. Multiple clicks needed for common tasks.";
    if (score >= 40) return "Moderate complexity. Acceptable for most teams.";
    if (score >= 20) return "Low friction. Navigation is fairly intuitive.";
    return "Minimal clicks required. Excellent navigation design.";
  };

  const getCognitiveExplanation = (score: number): string => {
    if (score >= 80) return "Overwhelming interface. Steep learning curve expected.";
    if (score >= 60) return "Complex UI with many options to learn.";
    if (score >= 40) return "Moderate learning curve. Most users adapt within days.";
    if (score >= 20) return "Clean, focused interface. Easy to understand.";
    return "Minimal cognitive overhead. Beginner-friendly design.";
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <Bug className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Score Debugger</h1>
            <p className="text-muted-foreground text-sm">Understand exactly how scores are calculated</p>
          </div>
        </div>

        {/* Smart Search */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1" ref={containerRef}>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder="Search products or enter URL..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    className="pl-12 pr-10 h-12 text-base bg-card border-border"
                    disabled={loading}
                  />
                  <ChevronDown 
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                  />
                  
                  {showSuggestions && suggestions.length > 0 && !loading && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-50">
                      <Command className="rounded-lg border border-border bg-popover shadow-lg">
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup heading={suggestions.some((s: any) => s.isCustom) ? "Suggestions" : "Popular Products"}>
                            {suggestions.map((product: any) => (
                              <CommandItem
                                key={product.url}
                                value={product.name}
                                onSelect={() => selectProduct(product)}
                                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent"
                              >
                                <img 
                                  src={`https://www.google.com/s2/favicons?domain=${(() => {
                                    try { return new URL(product.url).hostname; } catch { return ''; }
                                  })()}&sz=32`}
                                  alt=""
                                  className="w-5 h-5 rounded"
                                  onError={(e) => { e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%236b7280"><circle cx="12" cy="12" r="10"/></svg>'; }}
                                />
                                <div className="flex flex-col items-start text-left">
                                  <span className="font-medium text-foreground">{product.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {product.isCustom ? product.description : product.url}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading} className="h-12 px-6">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                  Debug Analysis
                </Button>
              </div>
            </form>
            {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
            {loading && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-muted-foreground">Analyzing product... This takes 30-45 seconds</span>
              </div>
            )}
          </CardContent>
        </Card>

        {debugData && (
          <>
            {/* Final Scores Overview */}
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Final Scores for {debugData.productName}
                </CardTitle>
                <CardDescription>{debugData.domain}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <ComplexityGradeBadge score={debugData.overallScore} size="lg" />
                    <p className="text-2xl font-bold mt-2">{debugData.overallScore}</p>
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-destructive">{debugData.clickTaxScore}</p>
                    <p className="text-sm text-muted-foreground">Click Tax</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-orange-500">{debugData.totalCognitiveLoad}</p>
                    <p className="text-sm text-muted-foreground">Cognitive Load</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{debugData.timeToValueEstimate}</p>
                    <p className="text-sm text-muted-foreground">Time to Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Known Product Baseline (if applicable) */}
            {debugData.knownBaseline && (
              <Card className="bg-primary/5 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    Known Product Baseline
                  </CardTitle>
                  <CardDescription>
                    {debugData.productName} is a pre-analyzed product with established complexity patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-background rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Starting Click Tax</span>
                        <Badge variant="outline">{debugData.knownBaseline.clickTaxBase}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Base complexity score from our product database
                      </p>
                    </div>
                    <div className="p-4 bg-background rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Has Templates</span>
                        {debugData.knownBaseline.hasTemplates ? (
                          <Badge variant="default" className="bg-emerald-500">Yes</Badge>
                        ) : (
                          <Badge variant="destructive">No</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {debugData.knownBaseline.hasTemplates 
                          ? "Templates reduce time-to-value significantly" 
                          : "No templates means longer setup time"}
                      </p>
                    </div>
                    <div className="p-4 bg-background rounded-lg border">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Enterprise Complexity</span>
                        {debugData.knownBaseline.isComplex ? (
                          <Badge variant="destructive">High</Badge>
                        ) : (
                          <Badge variant="default" className="bg-emerald-500">Low</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {debugData.knownBaseline.isComplex 
                          ? "Enterprise software with extensive customization" 
                          : "Consumer-friendly, designed for quick adoption"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* What These Scores Mean */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  What These Scores Mean
                </CardTitle>
                <CardDescription>Plain English explanation of each metric</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <ComplexityGradeBadge score={debugData.overallScore} size="sm" />
                    <h4 className="font-semibold">Overall Score: {debugData.overallScore}/100</h4>
                  </div>
                  <p className={`text-sm ${getScoreExplanation(debugData.overallScore).color}`}>
                    {getScoreExplanation(debugData.overallScore).text}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formula: 100 - (Click Tax × 0.5) - (Cognitive Load × 0.5)
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-5 w-5 text-destructive" />
                    <h4 className="font-semibold text-destructive">Click Tax: {debugData.clickTaxScore}/100</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getClickTaxExplanation(debugData.clickTaxScore)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Measures: navigation items, menu depth, documentation volume, enterprise signals
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="h-5 w-5 text-orange-500" />
                    <h4 className="font-semibold text-orange-500">Cognitive Load: {debugData.totalCognitiveLoad}/100</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getCognitiveExplanation(debugData.totalCognitiveLoad)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Measures: interface complexity signals, user sentiment, feature overwhelm indicators
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-primary">Time to Value: {debugData.timeToValueEstimate}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Estimated time until a typical user can perform core workflows productively.
                    {debugData.hasTemplates ? (
                      <span className="text-emerald-500 ml-1">Templates available to speed up setup.</span>
                    ) : (
                      <span className="text-destructive ml-1">No templates - custom configuration required.</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Base: 15 min + template/complexity adjustments + doc volume penalties
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Scoring Factors Explained */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Scoring Factors Explained
                </CardTitle>
                <CardDescription>Each factor that influences the final score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FactorRow
                  label="Navigation Complexity"
                  value={`${debugData.navItemCount} items, depth ${debugData.navDepth}`}
                  impact={debugData.navItemCount > 12 ? "negative" : debugData.navItemCount <= 6 ? "positive" : "neutral"}
                  explanation={
                    debugData.navItemCount <= 6 
                      ? "Simple, focused navigation reduces friction (-15 to Click Tax)"
                      : debugData.navItemCount <= 10
                      ? "Moderate complexity, typical for SaaS products (neutral)"
                      : debugData.navItemCount <= 15
                      ? "Many nav items increase cognitive load (+15 to Click Tax)"
                      : "Complex navigation with many options (+25 to Click Tax)"
                  }
                />

                <FactorRow
                  label="Documentation Volume"
                  value={`${debugData.docsFound} pages`}
                  impact={debugData.docsFound > 400 ? "negative" : debugData.docsFound <= 50 ? "positive" : "neutral"}
                  explanation={
                    debugData.docsFound <= 50 
                      ? "Lean docs suggest simpler product (-10 to Click Tax)"
                      : debugData.docsFound <= 150
                      ? "Moderate docs indicate reasonable feature set (neutral)"
                      : debugData.docsFound <= 400
                      ? "Extensive docs reflect complexity (+10 to Click Tax)"
                      : "Massive documentation indicates high complexity (+20 to Click Tax)"
                  }
                />

                <FactorRow
                  label="Template Availability"
                  value={debugData.hasTemplates ? "Available" : "Not Found"}
                  impact={debugData.hasTemplates ? "positive" : "negative"}
                  explanation={
                    debugData.hasTemplates 
                      ? "Templates, quick-starts, or prebuilt solutions detected (-20 to Click Tax)"
                      : "No templates detected - expect custom configuration (+10 to Click Tax)"
                  }
                />

                <FactorRow
                  label="Enterprise Signals"
                  value={debugData.isKnownComplexProduct ? "High Complexity" : debugData.isEnterpriseProduct ? "Enterprise" : "Consumer-friendly"}
                  impact={debugData.isKnownComplexProduct ? "negative" : debugData.isEnterpriseProduct ? "negative" : "neutral"}
                  explanation={
                    debugData.isKnownComplexProduct 
                      ? "Known enterprise product (Salesforce, Oracle, SAP tier) +30 penalty, 8× time multiplier"
                      : debugData.isEnterpriseProduct
                      ? "Enterprise-focused product +15 penalty, 2× time multiplier"
                      : "Standard product, no enterprise penalty applied"
                  }
                />

                <FactorRow
                  label="User Sentiment"
                  value={`${debugData.reviewSentiment.positive}% positive, ${debugData.reviewSentiment.negative}% negative`}
                  impact={debugData.isHighFriction ? "negative" : debugData.isMediumFriction ? "neutral" : "positive"}
                  explanation={
                    debugData.isHighFriction 
                      ? "High friction: negative reviews exceed positive (+10 Click Tax, +8 Cognitive)"
                      : debugData.isMediumFriction
                      ? "Medium friction: significant neutral/mixed feedback (+5 Click Tax, +4 Cognitive)"
                      : "Low friction: positive sentiment dominates (-5 Click Tax, -5 Cognitive)"
                  }
                />

                <FactorRow
                  label="Complexity Signals in Reviews"
                  value={`${debugData.navComplexityCount} negative, ${debugData.navSimplicityCount} positive`}
                  impact={debugData.navComplexityCount > debugData.navSimplicityCount ? "negative" : "positive"}
                  explanation={`Found ${debugData.navComplexityCount} mentions of navigation issues ("hard to find", "buried in menus") vs ${debugData.navSimplicityCount} positive signals ("easy to navigate", "intuitive")`}
                />

                <FactorRow
                  label="Cognitive Signals in Reviews"
                  value={`${debugData.cogComplexityCount} overwhelm, ${debugData.cogSimplicityCount} simplicity`}
                  impact={debugData.cogComplexityCount > debugData.cogSimplicityCount ? "negative" : "positive"}
                  explanation={`Found ${debugData.cogComplexityCount} cognitive complexity mentions ("overwhelming", "steep learning") vs ${debugData.cogSimplicityCount} simplicity mentions ("clean interface", "beginner friendly")`}
                />
              </CardContent>
            </Card>

            {/* Raw Data */}
            <Card>
              <CardHeader>
                <CardTitle>Raw Data Collected</CardTitle>
                <CardDescription>All signals gathered during analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <DataBox label="Nav Items" value={debugData.navItemCount} />
                  <DataBox label="Nav Depth" value={debugData.navDepth} />
                  <DataBox label="Docs Found" value={debugData.docsFound} />
                  <DataBox label="Doc Score" value={debugData.documentationScore} />
                  <DataBox label="Has Templates" value={debugData.hasTemplates ? "Yes" : "No"} />
                  <DataBox label="Is Enterprise" value={debugData.isEnterpriseProduct ? "Yes" : "No"} />
                  <DataBox label="Known Complex" value={debugData.isKnownComplexProduct ? "Yes" : "No"} />
                  <DataBox label="High Friction" value={debugData.isHighFriction ? "Yes" : "No"} />
                  <DataBox label="Positive Reviews" value={`${debugData.reviewSentiment.positive}%`} />
                  <DataBox label="Negative Reviews" value={`${debugData.reviewSentiment.negative}%`} />
                  <DataBox label="Setup Minutes" value={debugData.setupMinutes} />
                  <DataBox label="Nav Complexity" value={debugData.navComplexityCount} />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

function FactorRow({ 
  label, 
  value, 
  impact, 
  explanation 
}: { 
  label: string; 
  value: string; 
  impact: "positive" | "negative" | "neutral";
  explanation: string;
}) {
  return (
    <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {impact === "positive" && <CheckCircle className="h-4 w-4 text-emerald-500" />}
          {impact === "negative" && <XCircle className="h-4 w-4 text-destructive" />}
          {impact === "neutral" && <Info className="h-4 w-4 text-muted-foreground" />}
          <span className="font-medium">{label}</span>
        </div>
        <Badge variant={impact === "positive" ? "default" : impact === "negative" ? "destructive" : "secondary"}>
          {value}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">{explanation}</p>
    </div>
  );
}

function DataBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-3 bg-muted/50 rounded-lg">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-mono font-bold">{value}</p>
    </div>
  );
}
