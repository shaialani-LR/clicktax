import { MousePointerClick } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/30 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary glow-primary flex items-center justify-center">
              <MousePointerClick className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">ClickTax</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="https://foldspace.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              Simplify Your Product →
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 ClickTax. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}