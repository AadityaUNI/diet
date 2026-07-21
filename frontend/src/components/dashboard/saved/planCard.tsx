import { Trash2, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanMealRow } from "@/components/dashboard/saved/planMealRow";
import { PlanMacroChips } from "@/components/dashboard/saved/planMacroChips";
import type { FullPlanData } from "@/types/types";

interface PlanCardProps {
  plan: FullPlanData;
  isOpen: boolean;
  onToggleOpen: (id: number) => void;
  isActive: boolean;
  onSetActive: (id: number | null) => void;
  onDeletePlan: (id: number) => void;
}

export function PlanCard({ plan, isOpen, onToggleOpen, isActive, onSetActive, onDeletePlan }: PlanCardProps) {
  const chips = [
    { label: "Cal", value: plan.total_calories.toFixed(2), color: "text-foreground" },
    { label: "Protein", value: `${plan.total_protein.toFixed(2)}g`, color: "text-primary" },
    { label: "Carbs", value: `${plan.total_carbs.toFixed(2)}g`, color: "text-emerald-400" },
    { label: "Fat", value: `${plan.total_fats.toFixed(2)}g`, color: "text-amber-400" },
  ];

  return (
    <Card
      className={`cursor-pointer transition-colors ${isOpen ? "border-primary/40" : ""} ${isActive ? "border-emerald-400/50" : ""}`}
      onClick={() => onToggleOpen(plan.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-outfit text-sm font-semibold leading-snug">{plan.name}</span>
              {isActive && (
                <Badge className="bg-emerald-400/15 text-emerald-400 text-[10px] font-semibold">
                  Active Plan
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{plan.meal_plan_items.length} meals</span>
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
              {plan.meal_plan_items.map((item) => (
                <PlanMealRow
                  key={item.mealID}
                  name={item.meal_data.name}
                  totalCalories={item.meal_data.total_calories}
                  ingredientNames={item.meal_data.meal_items.map((mi) => mi.food_item.name)}
                />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              {isActive ? (
                <Button
                  variant="secondary"
                  className="flex-1"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActive(null);
                  }}
                >
                  De-select Active Plan
                </Button>
              ) : (
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActive(plan.id);
                  }}
                >
                  Use this Plan
                </Button>
              )}
              <Button variant="destructive" size="icon" className="shrink-0" onClick={() => onDeletePlan(plan.id)}>
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
