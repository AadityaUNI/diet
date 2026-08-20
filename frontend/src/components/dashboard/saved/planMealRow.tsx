import { cn } from "@/lib/utils"

const ROW_ACCENTS = [
  { wash: "bg-muted", bar: "bg-chart-1", kcal: "text-chart-1" },
  { wash: "bg-muted", bar: "bg-chart-2", kcal: "text-chart-2" },
  { wash: "bg-muted", bar: "bg-chart-3", kcal: "text-chart-3" },
] as const

interface PlanMealRowProps {
  name: string;
  totalCalories: number;
  ingredientNames: string[];
  accentIndex?: number;
}

export function PlanMealRow({ name, totalCalories, ingredientNames, accentIndex = 0 }: PlanMealRowProps) {
  const accent = ROW_ACCENTS[accentIndex % ROW_ACCENTS.length]
  return (
    <div className={cn("flex items-start gap-3 rounded-xl px-3 py-2", accent.wash)}>
      <span className={cn("mt-1 h-8 w-1 shrink-0 rounded-full", accent.bar)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className={cn("shrink-0 font-mono text-xs font-semibold", accent.kcal)}>
            {totalCalories.toFixed(2)} kcal
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{ingredientNames.join(" | ")}</p>
      </div>
    </div>
  );
}
