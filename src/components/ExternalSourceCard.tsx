import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Star, MessageSquare, HelpCircle, Globe,
  ExternalLink, TrendingUp, TrendingDown, Minus
} from "lucide-react";
import { ExternalSource } from "@/lib/api/analysis";

const categoryIcons = {
  documentation: FileText,
  reviews: Star,
  community: MessageSquare,
  help_center: HelpCircle,
  product: Globe,
};

const categoryLabels = {
  documentation: "Documentation",
  reviews: "User Reviews",
  community: "Community",
  help_center: "Help Center",
  product: "Product Pages",
};

const categoryColors = {
  documentation: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  reviews: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  community: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  help_center: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  product: "bg-primary/20 text-primary border-primary/30",
};

interface ExternalSourceCardProps {
  source: ExternalSource;
}

export function ExternalSourceCard({ source }: ExternalSourceCardProps) {
  const Icon = categoryIcons[source.category];
  const label = categoryLabels[source.category];
  const colorClass = categoryColors[source.category];

  const getSentimentIcon = () => {
    if (source.sentiment > 0.3) return <TrendingUp className="h-3 w-3 text-primary" />;
    if (source.sentiment < -0.3) return <TrendingDown className="h-3 w-3 text-destructive" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  const getSentimentLabel = () => {
    if (source.sentiment > 0.3) return "Positive";
    if (source.sentiment < -0.3) return "Negative";
    return "Neutral";
  };

  return (
    <Card className="border-border/50 hover:border-border transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-md ${colorClass}`}>
              <Icon className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-sm font-medium">{source.name}</CardTitle>
          </div>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3 text-xs">
          <Badge variant="outline" className="gap-1">
            {source.dataPoints} data points
          </Badge>
          <div className="flex items-center gap-1">
            {getSentimentIcon()}
            <span className="text-muted-foreground">{getSentimentLabel()}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {source.summary}
        </p>

        {source.frictionMentions.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-foreground">Friction mentions:</p>
            {source.frictionMentions.slice(0, 2).map((mention, i) => (
              <p
                key={i}
                className="text-xs text-muted-foreground italic border-l-2 border-chart-4/50 pl-2"
              >
                "{mention.slice(0, 100)}{mention.length > 100 ? '...' : ''}"
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
