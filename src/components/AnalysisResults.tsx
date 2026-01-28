import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, CheckCircle, MousePointerClick, Brain, Lightbulb, 
  ArrowRight, FileText, Timer, 
  UserPlus, Compass, RefreshCw, Info, Gauge, Shield,
  Globe, Star, MessageSquare, Clock, ExternalLink,
  TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ExternalSourceCard } from "./ExternalSourceCard";
import { ExternalSource } from "@/lib/api/analysis";
import { ScoreGauge } from "./ScoreGauge";
import { ComplexityGradeBadge } from "./ComplexityGradeBadge";

type Phase = "signup" | "onboarding" | "constant_use";

interface Step {
  page: string;
  action: string;
  difficulty: "easy" | "medium" | "hard";
  cognitiveScore: number;
  whyHard: string;
  phase: Phase;
  sources: string[];
}

interface PhaseMetrics {
  clickTax: number;
  cognitiveLoad: number;
  steps: Step[];
  summary: string;
}

interface DataCounts {
  pagesAnalyzed: number;
  docsFound: number;
  reviewsScanned: number;
  redditThreads: number;
  helpArticles: number;
}

export interface AnalysisResult {
  url: string;
  productName?: string;
  clickTaxScore: number; // Navigation complexity (0-100, higher = worse)
  totalCognitiveLoad: number; // Screen clutter (0-100, higher = worse)
  overallScore?: number; // Product simplicity (0-100, higher = better)
  phases: {
    signup: PhaseMetrics;
    onboarding: PhaseMetrics;
    constant_use: PhaseMetrics;
  };
  recommendations: string[];
  lighthousePerformance?: number;
  lighthouseAccessibility?: number;
  methodology: MethodologyItem[];
  externalSources?: ExternalSource[];
  documentationScore?: number;
  communityHealthScore?: number;
  reviewSentiment?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  timeToValueEstimate?: string;
  dataCounts?: DataCounts;
}

interface MethodologyItem {
  metric: string;
  sources: string[];
  description: string;
}

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const phaseIcons = {
  signup: UserPlus,
  onboarding: Compass,
  constant_use: RefreshCw,
};

const phaseLabels = {
  signup: "Sign-Up",
  onboarding: "Onboarding",
  constant_use: "Constant Use",
};

const phaseDescriptions = {
  signup: "From landing page to account creation",
  onboarding: "First-time user setup and configuration",
  constant_use: "Daily workflows and repeated actions",
};

const getDifficultyColor = (difficulty: Step["difficulty"]) => {
  switch (difficulty) {
    case "easy":
      return "bg-chart-2/20 text-chart-2 border-chart-2/30";
    case "medium":
      return "bg-chart-4/20 text-chart-4 border-chart-4/30";
    case "hard":
      return "bg-destructive/20 text-destructive border-destructive/30";
  }
};

// For overall score (higher = better)
const getScoreGrade = (score: number) => {
  if (score >= 70) return { grade: "A", label: "Excellent", color: "text-chart-2" };
  if (score >= 55) return { grade: "B", label: "Good", color: "text-primary" };
  if (score >= 40) return { grade: "C", label: "Moderate", color: "text-chart-4" };
  if (score >= 25) return { grade: "D", label: "Poor", color: "text-destructive" };
  return { grade: "F", label: "Critical", color: "text-destructive" };
};

// For click tax and cognitive load (lower = better, inverted)
const getFrictionGrade = (score: number) => {
  if (score <= 30) return { grade: "A", label: "Low Friction", color: "text-chart-2" };
  if (score <= 45) return { grade: "B", label: "Moderate", color: "text-primary" };
  if (score <= 60) return { grade: "C", label: "Notable", color: "text-chart-4" };
  if (score <= 75) return { grade: "D", label: "High Friction", color: "text-destructive" };
  return { grade: "F", label: "Severe", color: "text-destructive" };
};

const getCognitiveLoadColor = (score: number) => {
  if (score <= 40) return "text-chart-2";
  if (score <= 70) return "text-chart-4";
  return "text-destructive";
};

const getCognitiveLoadLabel = (score: number) => {
  if (score <= 40) return "Low friction";
  if (score <= 70) return "Moderate friction";
  return "High friction";
};

const getPhaseColor = (phase: Phase) => {
  switch (phase) {
    case "signup":
      return "bg-chart-1/20 text-chart-1 border-chart-1/30";
    case "onboarding":
      return "bg-chart-2/20 text-chart-2 border-chart-2/30";
    case "constant_use":
      return "bg-chart-5/20 text-chart-5 border-chart-5/30";
  }
};

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-chart-2";
  if (score >= 40) return "text-chart-4";
  return "text-destructive";
};

function SourceBadges({ sources }: { sources: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {sources.map((source, i) => (
        <Badge key={i} variant="outline" className="text-xs bg-accent/50 text-muted-foreground">
          {source}
        </Badge>
      ))}
    </div>
  );
}

function PhaseCard({ phase, metrics }: { phase: Phase; metrics: PhaseMetrics }) {
  const Icon = phaseIcons[phase];
  
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${getPhaseColor(phase)}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base">{phaseLabels[phase]}</CardTitle>
            <CardDescription className="text-xs">{phaseDescriptions[phase]}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Click Tax</p>
            <p className="text-2xl font-bold text-foreground">{metrics.clickTax}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Cognitive Load</p>
            <p className={`text-2xl font-bold ${getCognitiveLoadColor(metrics.cognitiveLoad)}`}>
              {metrics.cognitiveLoad}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{metrics.summary}</p>
      </CardContent>
    </Card>
  );
}

function StepsList({ steps }: { steps: Step[] }) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 rounded-xl bg-accent/50 border border-border/50"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="outline" className={getPhaseColor(step.phase)}>
                {phaseLabels[step.phase]}
              </Badge>
              <span className="font-medium text-foreground">{step.page}</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-muted-foreground">{step.action}</span>
              <Badge variant="outline" className={getDifficultyColor(step.difficulty)}>
                {step.difficulty}
              </Badge>
            </div>
            <div className="flex items-start gap-2 mt-2">
              <AlertTriangle className="h-4 w-4 text-chart-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">{step.whyHard}</p>
            </div>
            <SourceBadges sources={step.sources} />
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Load</span>
            <p className={`text-lg font-semibold ${getCognitiveLoadColor(step.cognitiveScore)}`}>
              +{step.cognitiveScore}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MethodologySection({ methodology }: { methodology: MethodologyItem[] }) {
  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Analysis Methodology
        </CardTitle>
        <CardDescription>
          How we measure friction using external data sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {methodology.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-primary" />
                  {item.metric}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-medium text-foreground">Data sources:</span>
                  {item.sources.map((source, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  // Overall simplicity score (higher = better)
  const overallScore = result.overallScore ?? 50;
  const scoreInfo = getScoreGrade(overallScore);
  
  // Click Tax = navigation complexity (higher = worse)
  const clickTaxInfo = getFrictionGrade(result.clickTaxScore);
  
  // Cognitive Load = screen clutter (higher = worse)
  const cognitiveInfo = getFrictionGrade(result.totalCognitiveLoad);

  const allSteps = [
    ...result.phases.signup.steps,
    ...result.phases.onboarding.steps,
    ...result.phases.constant_use.steps,
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Header with URL, Favicon, and Grade Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img 
            src={`https://www.google.com/s2/favicons?domain=${(() => {
              try { return new URL(result.url).hostname; } catch { return ''; }
            })()}&sz=64`}
            alt=""
            className="w-12 h-12 rounded-lg bg-card border border-border p-1"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">
                {result.productName || 'Product'}
              </h2>
              <ComplexityGradeBadge score={overallScore} size="sm" showLabel={false} />
            </div>
            <p className="font-mono text-sm text-muted-foreground truncate max-w-md">
              {result.url}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={onReset}>
          Analyze Another URL
        </Button>
      </div>

      {/* SECTION 1: Overall Simplicity Score - Hero */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent glow-border">
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col items-center">
            <ScoreGauge 
              score={Math.round(overallScore)} 
              grade={scoreInfo.grade} 
              label={scoreInfo.label} 
            />
            <p className="text-sm text-muted-foreground max-w-md mx-auto text-center mt-4">
              {overallScore >= 55 
                ? "This product has relatively low friction. Users can reach value quickly."
                : "This product has significant friction. Consider simplifying the user journey."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Key Metrics - Click Tax, Cognitive Load, Time-to-Value */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <MousePointerClick className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Click Tax</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Navigation complexity — how hard it is to find features. Lower is better.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${clickTaxInfo.color}`}>{result.clickTaxScore}</p>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className={`text-xs ${clickTaxInfo.color}`}>{clickTaxInfo.label}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Cognitive Load</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Screen clutter — how overwhelming the interface feels. Lower is better.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${cognitiveInfo.color}`}>{result.totalCognitiveLoad}</p>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <p className={`text-xs ${cognitiveInfo.color}`}>{cognitiveInfo.label}</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Time-to-Value</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>How long until users get value from the product. Shorter is better.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-3xl font-bold text-foreground">{result.timeToValueEstimate || "~30 min"}</p>
            <p className="text-xs text-muted-foreground">estimated setup time</p>
          </CardContent>
        </Card>
      </div>

      {/* User Sentiment - Separate Row */}
      {result.reviewSentiment && (
        <Card className="border-border/50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">User Sentiment from Reviews</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-chart-2" />
                  <span className="font-semibold text-chart-2">{result.reviewSentiment.positive}%</span>
                  <span className="text-xs text-muted-foreground">positive</span>
                </div>
                <div className="flex items-center gap-1">
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">{result.reviewSentiment.neutral}%</span>
                  <span className="text-xs text-muted-foreground">neutral</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="font-semibold text-destructive">{result.reviewSentiment.negative}%</span>
                  <span className="text-xs text-muted-foreground">negative</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 3: Data Sources Analyzed */}
      {result.dataCounts && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              Data Sources Analyzed
            </CardTitle>
            <CardDescription>
              External sources used to calculate your Click Tax Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 rounded-lg bg-accent/50 border border-border/30">
                <p className="text-2xl font-bold text-foreground">{result.dataCounts.pagesAnalyzed}</p>
                <p className="text-xs text-muted-foreground">Pages Analyzed</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/50 border border-border/30">
                <p className="text-2xl font-bold text-foreground">{result.dataCounts.docsFound}</p>
                <p className="text-xs text-muted-foreground">Docs Found</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/50 border border-border/30">
                <p className="text-2xl font-bold text-foreground">{result.dataCounts.reviewsScanned}</p>
                <p className="text-xs text-muted-foreground">Reviews Scanned</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/50 border border-border/30">
                <p className="text-2xl font-bold text-foreground">{result.dataCounts.redditThreads}</p>
                <p className="text-xs text-muted-foreground">Reddit Threads</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-accent/50 border border-border/30">
                <p className="text-2xl font-bold text-foreground">{result.dataCounts.helpArticles}</p>
                <p className="text-xs text-muted-foreground">Help Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Metrics Row */}
      {(result.documentationScore !== undefined || result.communityHealthScore !== undefined) && (
        <div className="grid md:grid-cols-2 gap-4">
          {result.documentationScore !== undefined && (
            <Card className="border-border/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Documentation Score</span>
                  </div>
                  <p className={`text-2xl font-bold ${getScoreColor(result.documentationScore)}`}>
                    {result.documentationScore}/100
                  </p>
                </div>
                <Progress value={result.documentationScore} className="h-2" />
              </CardContent>
            </Card>
          )}
          
          {result.communityHealthScore !== undefined && (
            <Card className="border-border/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Community Health</span>
                  </div>
                  <p className={`text-2xl font-bold ${getScoreColor(result.communityHealthScore)}`}>
                    {result.communityHealthScore}/100
                  </p>
                </div>
                <Progress value={result.communityHealthScore} className="h-2" />
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* SECTION 4: External Sources Details */}
      {result.externalSources && result.externalSources.length > 0 && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5 text-primary" />
              External Sources Breakdown
            </CardTitle>
            <CardDescription>
              {result.externalSources.length} sources scraped and analyzed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.externalSources.map((source, index) => (
                <ExternalSourceCard key={index} source={source} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 5: Journey Phase Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Gauge className="h-5 w-5 text-primary" />
          Journey Phase Breakdown
        </h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <PhaseCard phase="signup" metrics={result.phases.signup} />
          <PhaseCard phase="onboarding" metrics={result.phases.onboarding} />
          <PhaseCard phase="constant_use" metrics={result.phases.constant_use} />
        </div>
        
        {/* Collapsible Steps by Phase */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="signup-steps">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-chart-1" />
                Sign-Up Steps ({result.phases.signup.steps.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <StepsList steps={result.phases.signup.steps} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="onboarding-steps">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-chart-2" />
                Onboarding Steps ({result.phases.onboarding.steps.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <StepsList steps={result.phases.onboarding.steps} />
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="constant-use-steps">
            <AccordionTrigger className="text-left">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-chart-5" />
                Daily Use Steps ({result.phases.constant_use.steps.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <StepsList steps={result.phases.constant_use.steps} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Supporting Benchmarks */}
      {(result.lighthousePerformance || result.lighthouseAccessibility) && (
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-5 w-5 text-primary" />
              Supporting Benchmarks
            </CardTitle>
            <CardDescription>
              Technical metrics that can compound UX friction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6">
              {result.lighthousePerformance && (
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Performance:</span>
                  <span className={`font-semibold ${getScoreColor(result.lighthousePerformance)}`}>
                    {result.lighthousePerformance}
                  </span>
                </div>
              )}
              {result.lighthouseAccessibility && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Accessibility:</span>
                  <span className={`font-semibold ${getScoreColor(result.lighthouseAccessibility)}`}>
                    {result.lighthouseAccessibility}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SECTION 6: Recommendations */}
      {result.recommendations.length > 0 && (
        <Card className="border-chart-2/30 bg-gradient-to-br from-chart-2/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-chart-2" />
              Recommendations to Simplify
            </CardTitle>
            <CardDescription>
              Prioritized actions to reduce friction and improve user adoption
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 border border-border/30"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-chart-2/20 text-chart-2 flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <p className="text-sm text-foreground">{rec}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Methodology Section */}
      {result.methodology.length > 0 && (
        <MethodologySection methodology={result.methodology} />
      )}

      {/* CTA: Simplify Your Product */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-chart-2/10">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Ready to Simplify Your Product?</h3>
              <p className="text-muted-foreground">Get expert help reducing friction and boosting user adoption.</p>
            </div>
            <Button className="glow-primary gap-2" asChild>
              <a href="https://foldspace.ai" target="_blank" rel="noopener noreferrer">
                Simplify Your Product <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}