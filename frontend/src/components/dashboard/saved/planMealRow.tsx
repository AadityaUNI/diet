import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
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
  const [showIngredients, setShowIngredients] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accent = ROW_ACCENTS[accentIndex % ROW_ACCENTS.length]

  useEffect(() => () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  const clearLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const startLongPress = () => {
    clearLongPress();
    longPressTimer.current = setTimeout(() => {
      setShowIngredients(true);
      longPressTimer.current = null;
    }, 3000);
  };

  return (
    <div className={cn("flex items-start gap-3 rounded-xl px-3 py-2", accent.wash)}>
      <span className={cn("mt-1 h-8 w-1 shrink-0 rounded-full", accent.bar)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 break-words text-xs font-semibold leading-tight text-foreground sm:text-sm">{name}</span>
          <span className={cn("shrink-0 font-mono text-xs font-semibold", accent.kcal)}>
            {totalCalories.toFixed(2)} kcal
          </span>
        </div>
        <button
          type="button"
          aria-expanded={showIngredients}
          aria-label={`${showIngredients ? "Hide" : "Show"} ingredients for ${name}`}
          className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground sm:text-xs"
          onClick={() => setShowIngredients((visible) => !visible)}
          onPointerDown={startLongPress}
          onPointerUp={clearLongPress}
          onPointerCancel={clearLongPress}
          onPointerLeave={clearLongPress}
        >
          <ChevronDown size={14} className={cn("transition-transform", showIngredients && "rotate-180")} />
          {showIngredients ? "Hide ingredients" : "Show ingredients"}
        </button>
        {showIngredients && (
          <p className="mt-0.5 break-words text-[11px] text-muted-foreground sm:text-xs">{ingredientNames.join(" | ")}</p>
        )}
      </div>
    </div>
  );
}
