import { CheckCircle2, Circle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { MealData } from "@/types/types";

const ROW_ACCENTS = [
  { bar: "bg-chart-1", wash: "bg-chart-1/10", check: "text-chart-1", deco: "decoration-chart-1/40" },
  { bar: "bg-chart-2", wash: "bg-chart-2/10", check: "text-chart-2", deco: "decoration-chart-2/40" },
  { bar: "bg-chart-3", wash: "bg-chart-3/12", check: "text-chart-3", deco: "decoration-chart-3/40" },
] as const

interface MealRowProps {
  mealData: MealData;
  eaten: boolean;
  isLast: boolean;
  accentIndex?: number;
  onToggle: (mealID: number) => void;
}

export function MealRow({ mealData, eaten, isLast, accentIndex = 0, onToggle}: MealRowProps) {
  const accent = ROW_ACCENTS[accentIndex % ROW_ACCENTS.length]
  const pills = [
    { v: mealData.total_calories.toFixed(2), u: "kcal", c: "bg-secondary text-foreground/80" },
    { v: `${mealData.total_protein.toFixed(2)}g`, u: "P", c: "bg-chart-1/15 text-chart-1" },
    { v: `${mealData.total_carbs.toFixed(2)}g`, u: "C", c: "bg-chart-2/15 text-chart-2" },
    { v: `${mealData.total_fats.toFixed(2)}g`, u: "F", c: "bg-chart-3/20 text-chart-3" },
  ];
  const ingredients = mealData.meal_items
  return (
    <div>
      <button
        onClick={() => onToggle(mealData.id as number)}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors",
          eaten ? accent.wash : "hover:bg-white/5"
        )}
      >
        <span
          className={cn(
            "h-10 w-1 shrink-0 rounded-full",
            eaten ? accent.bar : `${accent.bar} opacity-40`
          )}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-sm font-semibold leading-none transition-colors",
              eaten ? `text-muted-foreground line-through ${accent.deco}` : "text-foreground"
            )}>
              {mealData.name}
            </span>
          </div>
          {ingredients.map((meal_item) => (
            <p key={meal_item.food_item.id} className="mt-0.5 truncate text-sm text-muted-foreground">
              {meal_item.food_item.name} ({meal_item.amount}g)
            </p>
          ))}
          
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {pills.map((p) => (
              <span key={p.u} className={cn("rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold", p.c)}>
                {p.v}<span className="font-normal opacity-70"> {p.u}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={cn("shrink-0 transition-colors", eaten ? accent.check : "text-muted-foreground/40")}>
          {eaten ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </div>
      </button>
      {!isLast && <Separator />}
    </div>
  );
}
