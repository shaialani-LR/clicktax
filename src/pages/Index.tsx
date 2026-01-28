import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Features } from "@/components/Features";
import { UrlAnalyzer } from "@/components/UrlAnalyzer";
import { AnalysisResults, AnalysisResult } from "@/components/AnalysisResults";
import { Badge } from "@/components/ui/badge";
import { MousePointerClick, Brain, ArrowDown, UserPlus, Compass, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
const Index = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  return <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28 relative overflow-hidden">
          {/* Background decoration - Foldspace style */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-40 right-1/4 w-96 h-96 bg-chart-2/10 rounded-full blur-3xl pointer-events-none" />

          <div className="container max-w-4xl mx-auto px-4 relative z-10">
            {!analysisResult ? <div className="text-center space-y-6 animate-in fade-in-50 duration-700">
                <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/30">
                  Free Product Friction Analysis
                </Badge>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Measure the{" "}
                  <span className="text-primary text-glow">Click Tax</span>{" "}
                  <span className="whitespace-nowrap">in Your Product Experience</span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">Analyze sign-up, onboarding, and daily workflows. Get a comprehensive friction score with data from G2, Reddit, docs & more.</p>


                {/* Metrics Preview */}
                <div className="flex flex-wrap justify-center gap-6 pb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MousePointerClick className="h-4 w-4 text-primary" />
                    <span>Click Tax: Actions to Value</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Brain className="h-4 w-4 text-primary" />
                    <span>Cognitive Load: Navigation Complexity</span>
                  </div>
                </div>

                <div className="pt-4">
                  <UrlAnalyzer onAnalysisComplete={handleAnalysisComplete} />
                </div>

                {/* Scroll indicator */}
                <div className="pt-12 animate-bounce">
                  <ArrowDown className="h-6 w-6 text-muted-foreground mx-auto" />
                </div>
              </div> : <AnalysisResults result={analysisResult} onReset={() => setAnalysisResult(null)} />}
          </div>
        </section>

        {/* Features Section - only show when no results */}
        {!analysisResult && <Features />}

        {/* How It Works Section */}
        {!analysisResult && <section className="py-20">
            <div className="container max-w-4xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
                Our analysis engine gathers data from multiple external sources to calculate your product's friction score.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto glow-primary">
                    1
                  </div>
                  <h3 className="font-semibold text-foreground">Paste Full URL</h3>
                  <p className="text-muted-foreground text-sm">
                    Enter the complete product URL including https://
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto glow-primary">
                    2
                  </div>
                  <h3 className="font-semibold text-foreground">We Analyze</h3>
                  <p className="text-muted-foreground text-sm">
                    Scan G2 reviews, Reddit threads, docs, and help centers for friction signals
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto glow-primary">
                    3
                  </div>
                  <h3 className="font-semibold text-foreground">Get Your Score</h3>
                  <p className="text-muted-foreground text-sm">
                    Receive a Click Tax Score with breakdown by phase and actionable recommendations
                  </p>
                </div>
              </div>
            </div>
          </section>}

        {/* Methodology Preview */}
        {!analysisResult && <section className="py-20 bg-card/50">
            <div className="container max-w-4xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-foreground mb-4">Transparent Methodology</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Every metric is backed by specific data sources. No black boxes.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border/50">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <MousePointerClick className="h-5 w-5 text-primary" />
                    Click Tax Sources
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      G2 & Capterra review analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Reddit community discussions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Documentation coverage mapping
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Help center quality assessment
                    </li>
                  </ul>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border/50">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Cognitive Load Sources
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Onboarding friction mentions
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Learning curve feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Setup time reports
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      User sentiment analysis
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>}

        {/* CTA Section */}
        {!analysisResult && <section className="py-20 bg-gradient-to-br from-primary/10 via-chart-2/5 to-transparent">
            <div className="container max-w-3xl mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Simplify Your Product
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Every extra click costs you conversions. Measure your friction and start optimizing today.
              </p>
              <div className="max-w-xl mx-auto mb-8">
                <UrlAnalyzer onAnalysisComplete={handleAnalysisComplete} />
              </div>
              <Button variant="outline" className="gap-2" asChild>
                <a href="https://foldspace.ai" target="_blank" rel="noopener noreferrer">
                  Get Help Simplifying <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </section>}
      </main>

      <Footer />
    </div>;
};
export default Index;