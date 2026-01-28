import { cn } from "@/lib/utils";

interface ComplexityGradeBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getGradeInfo(score: number) {
  if (score >= 80) return { grade: "A", label: "Excellent", color: "bg-emerald-500", textColor: "text-emerald-500" };
  if (score >= 65) return { grade: "B", label: "Good", color: "bg-green-500", textColor: "text-green-500" };
  if (score >= 50) return { grade: "C", label: "Moderate", color: "bg-yellow-500", textColor: "text-yellow-500" };
  if (score >= 35) return { grade: "D", label: "Poor", color: "bg-orange-500", textColor: "text-orange-500" };
  if (score >= 20) return { grade: "E", label: "Bad", color: "bg-red-500", textColor: "text-red-500" };
  return { grade: "F", label: "Critical", color: "bg-red-700", textColor: "text-red-700" };
}

export function ComplexityGradeBadge({ score, size = "md", showLabel = true }: ComplexityGradeBadgeProps) {
  const { grade, label, color } = getGradeInfo(score);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-xl",
    lg: "w-20 h-20 text-4xl",
  };

  const labelSizeClasses = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold text-white shadow-lg",
          color,
          sizeClasses[size]
        )}
      >
        {grade}
      </div>
      {showLabel && (
        <span className={cn("font-medium text-muted-foreground", labelSizeClasses[size])}>
          {label}
        </span>
      )}
    </div>
  );
}

export { getGradeInfo };
