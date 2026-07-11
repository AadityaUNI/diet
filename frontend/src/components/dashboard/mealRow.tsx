import { CheckCircle2, Circle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { MealData } from "@/types/types";

interface MealRowProps {
  mealData: MealData;
  eaten: boolean;
  isLast: boolean;
  // ingredients: {name: string, amount: number}[];
  onToggle: (mealID: number, planID: number) => void;
  planID: number 
}

export function MealRow({ mealData, eaten, isLast, onToggle, planID}: MealRowProps) {
  const pills = [
    { v: mealData.total_calories.toFixed(2), u: "kcal", c: "text-foreground/70" },
    { v: `${mealData.total_protein.toFixed(2)}g`, u: "P", c: "text-[#4f7eff]" },
    { v: `${mealData.total_carbs.toFixed(2)}g`, u: "C", c: "text-emerald-400" },
    { v: `${mealData.total_fats.toFixed(2)}g`, u: "F", c: "text-amber-400" },
  ];
  const ingredients = mealData.meal_items // array of meal items 
  return (
    <div>
      <button
        onClick={() => onToggle(mealData.id as number, planID)}
        className="flex w-full items-center gap-3 py-2.5 text-left transition-opacity"
      >

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold leading-none transition-colors ${
              eaten ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"
            }`}>
              {mealData.name}
            </span>
          </div>
          {ingredients.map((meal_item) => <p key={meal_item.food_item.id} className="mt-0.5 truncate text-sm text-slate-400">{meal_item.food_item.name} ({meal_item.amount}g)</p>)}
          
          <div className="mt-1.5 flex gap-1.5">
            {pills.map((p) => (
              <span key={p.u} className={`font-mono text-[11px] font-semibold ${p.c}`}>
                {p.v}<span className="font-normal text-muted-foreground opacity-70"> {p.u}</span>
              </span>
            ))}
          </div>
        </div>

        <div className={`shrink-0 transition-colors ${eaten ? "text-emerald-400" : "text-muted-foreground/40"}`}>
          {eaten ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </div>
      </button>
      {!isLast && <Separator />}
    </div>
  );
}