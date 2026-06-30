// components/dashboard/meal-row.tsx
import { CheckCircle2, Circle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface Meal {
  id: string;
  emoji: string;
  name: string;
  time: string;
  ingredients: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MealRowProps {
  meal: Meal;
  eaten: boolean;
  isLast: boolean;
  onToggle: (id: string) => void;
}

export function MealRow({ meal, eaten, isLast, onToggle }: MealRowProps) {
  const pills = [
    { v: meal.calories, u: "kcal", c: "text-foreground/70" },
    { v: `${meal.protein}g`, u: "P", c: "text-[#4f7eff]" },
    { v: `${meal.carbs}g`, u: "C", c: "text-emerald-400" },
    { v: `${meal.fat}g`, u: "F", c: "text-amber-400" },
  ];

  return (
    <div>
      <button
        onClick={() => onToggle(meal.id)}
        className="flex w-full items-center gap-3 py-2.5 text-left transition-opacity"
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg transition-colors ${
          eaten ? "bg-primary/15" : "bg-secondary/60"
        }`}>
          {meal.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold leading-none transition-colors ${
              eaten ? "text-muted-foreground line-through decoration-muted-foreground/50" : "text-foreground"
            }`}>
              {meal.name}
            </span>
            <span className="text-[10px] text-muted-foreground">{meal.time}</span>
          </div>
          <p className="mt-0.5 truncate text-[13px] text-slate-400">{meal.ingredients}</p>
          <div className="mt-1.5 flex gap-1.5">
            {pills.map((p) => (
              <span key={p.u} className={`font-mono text-[10px] font-semibold ${p.c}`}>
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