import { BookmarkPlus, BookmarkCheck, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PlanMealRow } from "@/components/dashboard/saved/planMealRow";
import { PlanMacroChips } from "@/components/dashboard/saved/planMacroChips";
import type { GeneratedPlan } from "@/types/generated-plan";

interface RecommendedPlanCardProps {
  plan: GeneratedPlan;
  isOpen: boolean;
  onToggleOpen: () => void;
  isSaved: boolean;
  onSave: (plan: GeneratedPlan) => void;
  savedLoading: boolean
}

export function RecommendedPlanCard({ plan, isOpen, onToggleOpen, isSaved, onSave, savedLoading }: RecommendedPlanCardProps) {
  const chips = [
    { label: "Cal", value: plan.total_calories.toFixed(2), color: "text-foreground" },
    { label: "Protein", value: `${plan.total_protein.toFixed(2)}g`, color: "text-primary" },
    { label: "Carbs", value: `${plan.total_carbs.toFixed(2)}g`, color: "text-emerald-400" },
    { label: "Fat", value: `${plan.total_fats.toFixed(2)}g`, color: "text-amber-400" },
  ];

  return (
    <Card
      className={`cursor-pointer transition-colors ${isOpen ? "border-primary/40" : ""}`}
      onClick={onToggleOpen}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-outfit text-sm font-semibold leading-snug">{plan.name}</span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{plan.meals.length} meals</span>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`mt-1 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>

        <PlanMacroChips chips={chips} />

        {isOpen && (
          <div onClick={(e) => e.stopPropagation()}>
            <Separator className="my-4" />
            <div className="flex flex-col gap-3">
              {plan.meals.map((meal) => (
                <PlanMealRow
                  key={meal.name}
                  name={meal.name}
                  totalCalories={meal.total_calories}
                  ingredientNames={meal.ingredients.map((ing) => ing.name)}
                />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant={isSaved ? "secondary" : "default"}
                className="flex-1 gap-1.5"
                size="sm"
                disabled={isSaved || savedLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  onSave(plan);
                }}
              >
                {isSaved
                  ? <><BookmarkCheck size={14} /> Saved</>
                  : <><BookmarkPlus size={14} /> Save this Plan</>}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
