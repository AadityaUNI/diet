interface PlanMealRowProps {
  name: string;
  totalCalories: number;
  ingredientNames: string[];
}

export function PlanMealRow({ name, totalCalories, ingredientNames }: PlanMealRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-foreground">{name}</span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {totalCalories.toFixed(2)} kcal
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{ingredientNames.join(" | ")}</p>
      </div>
    </div>
  );
}
