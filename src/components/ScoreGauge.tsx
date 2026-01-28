import { useEffect, useState } from "react";

interface ScoreGaugeProps {
  score: number;
  grade: string;
  label: string;
}

const getScoreColorClass = (score: number) => {
  if (score >= 70) return "text-chart-2";
  if (score >= 55) return "text-primary";
  if (score >= 40) return "text-chart-4";
  return "text-destructive";
};

const getScoreStrokeColor = (score: number) => {
  if (score >= 70) return "hsl(var(--chart-2))";
  if (score >= 55) return "hsl(var(--primary))";
  if (score >= 40) return "hsl(var(--chart-4))";
  return "hsl(var(--destructive))";
};

export function ScoreGauge({ score, grade, label }: ScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [strokeOffset, setStrokeOffset] = useState(283);

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    // Animate the score number
    const duration = 1500;
    const steps = 60;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);

    // Animate the stroke
    setTimeout(() => {
      setStrokeOffset(targetOffset);
    }, 100);

    return () => clearInterval(timer);
  }, [score, targetOffset]);

  const colorClass = getScoreColorClass(score);
  const strokeColor = getScoreStrokeColor(score);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48 md:w-56 md:h-56">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{ backgroundColor: strokeColor }}
        />
        
        {/* SVG Circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="8"
            className="opacity-30"
          />
          
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            className="transition-all duration-[1500ms] ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl md:text-6xl font-bold ${colorClass}`}>
            {animatedScore}
          </span>
          <div className={`text-lg font-semibold ${colorClass} border border-current px-3 py-0.5 rounded-full mt-1`}>
            {grade}
          </div>
        </div>
      </div>
      
      {/* Label below */}
      <p className={`text-lg font-medium ${colorClass} mt-2`}>{label}</p>
      <p className="text-sm text-muted-foreground">Product Simplicity Score</p>
    </div>
  );
}
