import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

export interface ExternalSource {
  name: string;
  category: 'documentation' | 'reviews' | 'community' | 'help_center' | 'product';
  dataPoints: number;
  sentiment: number;
  frictionMentions: string[];
  url: string;
  summary: string;
}

export interface DataCounts {
  pagesAnalyzed: number;
  docsFound: number;
  reviewsScanned: number;
  redditThreads: number;
  helpArticles: number;
}

export interface AnalysisApiResponse {
  success: boolean;
  error?: string;
  url?: string;
  productName?: string;
  clickTaxScore?: number; // Navigation complexity (0-100, higher = worse)
  totalCognitiveLoad?: number; // Screen clutter (0-100, higher = worse)
  overallScore?: number; // Product simplicity (0-100, higher = better)
  lighthousePerformance?: number;
  lighthouseAccessibility?: number;
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
  phases?: {
    signup: PhaseData;
    onboarding: PhaseData;
    constant_use: PhaseData;
  };
  recommendations?: string[];
  methodology?: MethodologyItem[];
}

interface PhaseData {
  clickTax: number;
  cognitiveLoad: number;
  summary: string;
  steps: StepData[];
}

interface StepData {
  page: string;
  action: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cognitiveScore: number;
  whyHard: string;
  phase: string;
  sources: string[];
}

interface MethodologyItem {
  metric: string;
  sources: string[];
  description: string;
}

export async function analyzeProduct(url: string): Promise<AnalysisApiResponse> {
  const { data, error } = await supabase.functions.invoke('analyze-product', {
    body: { url },
  });

  // Check data first - edge function returns details in the body
  if (data) {
    return data;
  }

  if (error) {
    console.error('Analysis API error:', error);
    
    // For FunctionsHttpError, extract the actual response body
    if (error instanceof FunctionsHttpError) {
      try {
        const errorData = await error.context.json();
        if (errorData && errorData.error) {
          return { success: false, error: errorData.error };
        }
      } catch {
        // JSON parsing failed, fall through to generic error
      }
    }
    
    return { success: false, error: error.message };
  }

  return { success: false, error: 'Unknown error occurred' };
}
