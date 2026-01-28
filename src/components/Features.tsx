import { MousePointerClick, Brain, ListChecks, Lightbulb, UserPlus, Compass, RefreshCw, FileText } from "lucide-react";

const features = [
  {
    icon: UserPlus,
    title: "Sign-Up Analysis",
    description: "Measure friction from landing page to account creation: CTAs, pricing decisions, form fields, and verification steps.",
  },
  {
    icon: Compass,
    title: "Onboarding Analysis",
    description: "Track the path to first value: welcome flows, profile setup, required integrations, and tutorial walkthroughs.",
  },
  {
    icon: RefreshCw,
    title: "Constant Use Analysis",
    description: "Evaluate daily workflow friction: navigation depth, primary action accessibility, and shortcut availability.",
  },
  {
    icon: MousePointerClick,
    title: "Click Tax Measurement",
    description: "Count every discrete action required across all phases using headless browser automation.",
  },
  {
    icon: Brain,
    title: "Cognitive Load Scoring",
    description: "0-100 score based on Hick's Law, form complexity, visual noise, interruptions, and context switches.",
  },
  {
    icon: FileText,
    title: "Transparent Methodology",
    description: "See exactly which data sources contribute to each metric with full source attribution per step.",
  },
  {
    icon: ListChecks,
    title: "Step-by-Step Breakdown",
    description: "View each page and action with difficulty ratings, phase labels, and specific friction explanations.",
  },
  {
    icon: Lightbulb,
    title: "Prioritized Recommendations",
    description: "Get actionable tips ranked by impact: reduce clicks, simplify decisions, speed up time-to-value.",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-accent/30">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Complete User Journey Analysis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We analyze friction across three critical phases: Sign-Up, Onboarding, and Constant Use—with full transparency on our methodology.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-card rounded-xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
