import { CheckCircle2, Circle } from "lucide-react";

interface PlanMeal {
  name: string;
  calories: number;
  ingredients: string;
  done: boolean;
}

export function PlanMealRow({ meal }: { meal: PlanMeal }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-0.5 shrink-0 ${meal.done ? "text-emerald-400" : "text-muted-foreground"}`}>
        {meal.done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-semibold ${meal.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
            {meal.name}
          </span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{meal.calories} kcal</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{meal.ingredients}</p>
      </div>
    </div>
  );
}