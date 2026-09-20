import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Circle, ChevronDown } from "lucide-react";
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
  const [showIngredients, setShowIngredients] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const accent = ROW_ACCENTS[accentIndex % ROW_ACCENTS.length]
  const pills = [
    { v: mealData.total_calories.toFixed(2), u: "kcal", c: "bg-secondary text-foreground/80" },
    { v: `${mealData.total_protein.toFixed(2)}g`, u: "P", c: "bg-chart-1/15 text-chart-1" },
    { v: `${mealData.total_carbs.toFixed(2)}g`, u: "C", c: "bg-chart-2/15 text-chart-2" },
    { v: `${mealData.total_fats.toFixed(2)}g`, u: "F", c: "bg-chart-3/20 text-chart-3" },
  ];
  const ingredients = mealData.meal_items

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
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onToggle(mealData.id as number)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onToggle(mealData.id as number);
          }
        }}
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
              "text-[13px] font-semibold leading-tight transition-colors sm:text-sm",
              eaten ? `text-muted-foreground line-through ${accent.deco}` : "text-foreground"
            )}>
              {mealData.name}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              aria-expanded={showIngredients}
              aria-label={`${showIngredients ? "Hide" : "Show"} ingredients for ${mealData.name}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground sm:text-xs"
              onClick={(event) => {
                event.stopPropagation();
                setShowIngredients((visible) => !visible);
              }}
              onPointerDown={startLongPress}
              onPointerUp={clearLongPress}
              onPointerCancel={clearLongPress}
              onPointerLeave={clearLongPress}
            >
              <ChevronDown size={14} className={cn("transition-transform", showIngredients && "rotate-180")} />
              {showIngredients ? "Hide ingredients" : "Show ingredients"}
            </button>
          </div>
          {showIngredients && ingredients.map((meal_item) => (
            <p key={meal_item.food_item.id} className="mt-0.5 break-words text-xs text-muted-foreground sm:text-sm">
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
      </div>
      {!isLast && <Separator />}
    </div>
  );
}
