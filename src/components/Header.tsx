import { Button } from "@/components/ui/button";
import { MousePointerClick } from "lucide-react";

export function Header() {
  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary glow-primary flex items-center justify-center">
            <MousePointerClick className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground">ClickTax</span>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Pricing
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            Examples
          </Button>
          <Button size="sm" className="glow-primary">
            Sign In
          </Button>
        </nav>
      </div>
    </header>
  );
}