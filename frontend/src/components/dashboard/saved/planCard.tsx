import { Bookmark, BookmarkCheck, Flag, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlanMealRow } from "@/components/dashboard/saved/planMealRow";

export interface SavedPlan {
  id: string;
  name: string;
  date: string;
  goal: string;
  conditions: string[];
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  meals: { name: string; calories: number; ingredients: string; done: boolean }[];
}

interface PlanCardProps {
  plan: SavedPlan;
  isOpen: boolean;
  isBookmarked: boolean;
  goalStyle: { color: string; label: string };
  onToggleOpen: (id: string) => void;
  onToggleBookmark: (id: string) => void;
}

export function PlanCard({ plan, isOpen, isBookmarked, goalStyle, onToggleOpen, onToggleBookmark }: PlanCardProps) {
  const doneCount = plan.meals.filter((m) => m.done).length;
  const allDone = doneCount === plan.meals.length;

  const chips = [
    { label: "Cal", value: plan.totalCalories.toLocaleString(), color: "text-foreground" },
    { label: "Prot", value: `${plan.protein}g`, color: "text-primary" },
    { label: "Carbs", value: `${plan.carbs}g`, color: "text-emerald-400" },
    { label: "Fat", value: `${plan.fat}g`, color: "text-amber-400" },
  ];

  return (
    <Card
      className={`cursor-pointer transition-colors ${isOpen ? "border-primary/40" : ""}`}
      onClick={() => onToggleOpen(plan.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-outfit text-sm font-semibold leading-snug">{plan.name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{plan.date}</span>
              <span className="text-border">·</span>
              <span className="flex items-center gap-1 font-semibold" style={{ color: goalStyle.color }}>
                <Flag size={10} /> {goalStyle.label}
              </span>
              {plan.conditions.length > 0 && (
                <>
                  <span className="text-border">·</span>
                  <span>{plan.conditions[0]}</span>
                </>
              )}
            </div>
          </div>

          <button
            className="shrink-0 p-0.5 text-muted-foreground transition-colors hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(plan.id);
            }}
          >
            {isBookmarked ? <BookmarkCheck size={17} className="text-primary" /> : <Bookmark size={17} />}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((m) => (
            <div key={m.label} className="rounded-lg bg-secondary/50 px-2 py-1">
              <span className={`block font-mono text-xs font-bold leading-none ${m.color}`}>{m.value}</span>
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
          <div className="ml-auto rounded-lg bg-secondary/50 px-2 py-1">
            <span className={`block font-mono text-xs font-bold leading-none ${allDone ? "text-emerald-400" : "text-muted-foreground"}`}>
              {doneCount}/{plan.meals.length}
            </span>
            <span className="text-[10px] text-muted-foreground">done</span>
          </div>
        </div>

        {isOpen && (
          <div onClick={(e) => e.stopPropagation()}>
            <Separator className="my-4" />
            <div className="flex flex-col gap-3">
              {plan.meals.map((meal, i) => (
                <PlanMealRow key={i} meal={meal} />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" size="sm">Use this Plan</Button>
              <Button variant="destructive" size="icon" className="shrink-0">
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}