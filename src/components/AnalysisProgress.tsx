import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { 
  Globe, FileText, Star, MessageSquare, HelpCircle, Calculator, 
  CheckCircle, Loader2 
} from "lucide-react";

// Stages timed to match parallelized backend (~35-45 seconds total)
const stages = [
  { id: 1, label: "Scraping product pages", icon: Globe, duration: 5000, dataLabel: "pages analyzed" },
  { id: 2, label: "Mapping documentation", icon: FileText, duration: 6000, dataLabel: "docs found" },
  { id: 3, label: "Analyzing reviews & discussions", icon: Star, duration: 8000, dataLabel: "sources analyzed" },
  { id: 4, label: "Indexing help resources", icon: HelpCircle, duration: 5000, dataLabel: "articles indexed" },
  { id: 5, label: "Calculating Click Tax Score", icon: Calculator, duration: 6000, dataLabel: "metrics computed" },
];

interface AnalysisProgressProps {
  isAnalyzing: boolean;
}

export function AnalysisProgress({ isAnalyzing }: AnalysisProgressProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [dataCounts, setDataCounts] = useState<number[]>([0, 0, 0, 0, 0]);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStage(0);
      setProgress(0);
      setDataCounts([0, 0, 0, 0, 0]);
      return;
    }

    let stageIndex = 0;
    let elapsed = 0;
    const totalDuration = stages.reduce((sum, s) => sum + s.duration, 0);

    // Simulate data counts incrementing (5 stages now)
    const targetCounts = [3, 47, 95, 12, 8];

    const interval = setInterval(() => {
      elapsed += 100;
      
      // Calculate which stage we're in
      let cumulativeDuration = 0;
      for (let i = 0; i < stages.length; i++) {
        cumulativeDuration += stages[i].duration;
        if (elapsed < cumulativeDuration) {
          stageIndex = i;
          break;
        }
        stageIndex = stages.length - 1;
      }
      
      setCurrentStage(stageIndex);
      setProgress(Math.min((elapsed / totalDuration) * 100, 95));

      // Update data counts progressively
      setDataCounts(prev => {
        const newCounts = [...prev];
        for (let i = 0; i <= stageIndex; i++) {
          const stageProgress = i < stageIndex ? 1 : 
            (elapsed - stages.slice(0, i).reduce((sum, s) => sum + s.duration, 0)) / stages[i].duration;
          newCounts[i] = Math.floor(targetCounts[i] * Math.min(stageProgress, 1));
        }
        return newCounts;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  if (!isAnalyzing) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Deep Analysis in Progress</span>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Gathering External Data Sources
        </h3>
        <p className="text-sm text-muted-foreground">
          More sources = more accurate friction analysis
        </p>
      </div>

      <div className="relative">
        <Progress value={progress} className="h-3" />
        <span className="absolute right-0 -top-6 text-xs text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="grid gap-3">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === currentStage;
          const isComplete = index < currentStage;
          const count = dataCounts[index];

          return (
            <div
              key={stage.id}
              className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-primary/10 border border-primary/30 glow-border"
                  : isComplete
                  ? "bg-accent border border-border/50"
                  : "bg-card/50 border border-border/20 opacity-50"
              }`}
            >
              <div
                className={`p-2.5 rounded-lg ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : isComplete
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {isActive ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : isComplete ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="flex-1">
                <span
                  className={`text-sm ${
                    isActive
                      ? "text-foreground font-medium"
                      : isComplete
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {stage.label}
                </span>
                {(isActive || isComplete) && count > 0 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {count} {stage.dataLabel}
                  </p>
                )}
              </div>
              {isActive && (
                <span className="text-xs text-primary font-medium animate-pulse">
                  Scanning...
                </span>
              )}
              {isComplete && (
                <span className="text-xs text-muted-foreground">
                  ✓ Complete
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        This comprehensive analysis takes 30-45 seconds
      </p>
    </div>
  );
}