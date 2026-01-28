import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AnalysisResult } from "./AnalysisResults";
import { AnalysisProgress } from "./AnalysisProgress";
import { analyzeProduct } from "@/lib/api/analysis";
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

// Helper to extract a readable name from a URL
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

// Check if input looks like a URL
const looksLikeUrl = (input: string): boolean => {
  const cleaned = input.trim().toLowerCase();
  return cleaned.includes('.') && !cleaned.includes(' ');
};

interface UrlAnalyzerProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
}

const COOLDOWN_MS = 5000; // 5 second cooldown between requests

export function UrlAnalyzer({ onAnalysisComplete }: UrlAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [validationError, setValidationError] = useState<{ message: string; url: string } | null>(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate suggestions: custom URL option + filtered popular products
  const suggestions = useMemo(() => {
    const searchTerm = url.toLowerCase().replace('https://', '').replace('http://', '').replace('www.', '').trim();
    
    // Filter popular products
    const filtered = searchTerm 
      ? POPULAR_PRODUCTS.filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.url.toLowerCase().includes(searchTerm)
        ).slice(0, 6)
      : POPULAR_PRODUCTS.slice(0, 8);
    
    // Always show a custom option if there's text and it doesn't exactly match a known product
    if (searchTerm) {
      const exactMatch = POPULAR_PRODUCTS.some(p => 
        p.name.toLowerCase() === searchTerm
      );
      
      if (!exactMatch) {
        // Build URL: if it looks like a URL use it, otherwise add .com
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Shared analysis logic
  const runAnalysis = async (targetUrl: string) => {
    // Client-side cooldown
    const now = Date.now();
    if (now - lastRequestTime < COOLDOWN_MS) {
      toast({
        title: "Please wait",
        description: "Please wait a few seconds before analyzing another URL.",
        variant: "destructive",
      });
      return;
    }
    
    let trimmedUrl = targetUrl.trim();

    if (!trimmedUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a product URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    // Auto-prepend https:// if missing
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      trimmedUrl = `https://${trimmedUrl}`;
    }

    try {
      new URL(trimmedUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL.",
        variant: "destructive",
      });
      return;
    }

    setValidationError(null);
    setUrl(trimmedUrl);
    setShowSuggestions(false);
    setIsAnalyzing(true);
    setLastRequestTime(now);

    try {
      const response = await analyzeProduct(trimmedUrl);
      
      if (!response.success || !response.phases) {
        // Check if this is a validation error (missing signup)
        const errorMessage = response.error || "Analysis failed";
        const isValidationError = errorMessage.toLowerCase().includes('sign-up') || 
          errorMessage.toLowerCase().includes('signup') ||
          errorMessage.toLowerCase().includes('self-serve');
        
        if (isValidationError) {
          setValidationError({ message: errorMessage, url: trimmedUrl });
          return;
        }
        throw new Error(errorMessage);
      }

      const result: AnalysisResult = {
        url: response.url || trimmedUrl,
        productName: response.productName,
        clickTaxScore: response.clickTaxScore || 0,
        totalCognitiveLoad: response.totalCognitiveLoad || 0,
        overallScore: response.overallScore,
        lighthousePerformance: response.lighthousePerformance,
        lighthouseAccessibility: response.lighthouseAccessibility,
        externalSources: response.externalSources || [],
        documentationScore: response.documentationScore,
        communityHealthScore: response.communityHealthScore,
        reviewSentiment: response.reviewSentiment,
        timeToValueEstimate: response.timeToValueEstimate,
        dataCounts: response.dataCounts,
        phases: {
          signup: {
            clickTax: response.phases.signup.clickTax,
            cognitiveLoad: response.phases.signup.cognitiveLoad,
            summary: response.phases.signup.summary,
            steps: response.phases.signup.steps.map(s => ({
              ...s,
              difficulty: s.difficulty as "easy" | "medium" | "hard",
              phase: s.phase as "signup" | "onboarding" | "constant_use",
            })),
          },
          onboarding: {
            clickTax: response.phases.onboarding.clickTax,
            cognitiveLoad: response.phases.onboarding.cognitiveLoad,
            summary: response.phases.onboarding.summary,
            steps: response.phases.onboarding.steps.map(s => ({
              ...s,
              difficulty: s.difficulty as "easy" | "medium" | "hard",
              phase: s.phase as "signup" | "onboarding" | "constant_use",
            })),
          },
          constant_use: {
            clickTax: response.phases.constant_use.clickTax,
            cognitiveLoad: response.phases.constant_use.cognitiveLoad,
            summary: response.phases.constant_use.summary,
            steps: response.phases.constant_use.steps.map(s => ({
              ...s,
              difficulty: s.difficulty as "easy" | "medium" | "hard",
              phase: s.phase as "signup" | "onboarding" | "constant_use",
            })),
          },
        },
        recommendations: response.recommendations || [],
        methodology: response.methodology || [],
      };

      onAnalysisComplete(result);
      toast({
        title: "Analysis Complete",
        description: `Analyzed ${result.externalSources?.length || 0} external sources for comprehensive friction data.`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Click on dropdown item triggers analysis immediately
  const selectProduct = (product: { name: string; url: string; icon: string }) => {
    runAnalysis(product.url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(url);
  };

  if (isAnalyzing) {
    return <AnalysisProgress isAnalyzing={isAnalyzing} />;
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
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
              if (validationError) setValidationError(null);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="pl-12 pr-10 h-14 text-base bg-card border-border shadow-md focus-visible:ring-primary"
            disabled={isAnalyzing}
          />
          <ChevronDown 
            className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
            onClick={() => setShowSuggestions(!showSuggestions)}
          />
          
          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
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
        <Button
          type="submit"
          size="lg"
          className="h-14 px-8 text-base font-semibold shadow-lg glow-primary"
          disabled={isAnalyzing}
        >
          Analyze Product
        </Button>
      </div>
      
      {/* Friendly inline note for validation errors */}
      {validationError ? (
        <div className="mt-4 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">
                We couldn't analyze {validationError.url.replace('https://', '').replace('http://', '')}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                This tool works best with self-serve products that let you sign up directly 
                (like Notion, Linear, or Stripe). Enterprise products that require contacting 
                sales aren't supported yet.
              </p>
              <p className="text-sm text-muted-foreground">
                Try searching for a different product above!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-sm text-muted-foreground mt-3">
          Search for a product or paste any website URL
        </p>
      )}
    </form>
  );
}
