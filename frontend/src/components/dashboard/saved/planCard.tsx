import { Trash2, ChevronDown, PencilLine, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanMealRow } from "@/components/dashboard/saved/planMealRow";
import { PlanMacroChips } from "@/components/dashboard/saved/planMacroChips";
import { cn } from "@/lib/utils";
import type { FullPlanData } from "@/types/types";

interface PlanCardProps {
  plan: FullPlanData;
  isOpen: boolean;
  onToggleOpen: (id: number) => void;
  isActive: boolean;
  onSetActive: (id: number | null) => void;
  onDeletePlan: (id: number) => void;
  onEditPlan: (plan: FullPlanData) => void;
  onOptimizePlan: (plan: FullPlanData) => void;
}

export function PlanCard({ plan, isOpen, onToggleOpen, isActive, onSetActive, onDeletePlan, onEditPlan, onOptimizePlan }: PlanCardProps) {
  const chips = [
    { label: "Cal", value: plan.total_calories.toFixed(2), color: "text-foreground", chip: "bg-muted" },
    { label: "Protein", value: `${plan.total_protein.toFixed(2)}g`, color: "text-chart-1", chip: "bg-chart-1/12" },
    { label: "Carbs", value: `${plan.total_carbs.toFixed(2)}g`, color: "text-chart-2", chip: "bg-chart-2/12" },
    { label: "Fat", value: `${plan.total_fats.toFixed(2)}g`, color: "text-chart-3", chip: "bg-chart-3/15" },
  ];

  return (
    <Card
      className={cn(
        "cursor-pointer bg-muted dark:bg-secondary transition-colors",
        isActive ? "ring-2 ring-primary/50" : isOpen ? "ring-1 ring-border" : ""
      )}
      onClick={() => onToggleOpen(plan.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex min-w-0 flex-wrap items-center gap-2 overflow-visible">
              <span className="w-full overflow-visible whitespace-normal break-words [overflow-wrap:anywhere] font-outfit text-sm font-semibold leading-snug">{plan.name}</span>
              {isActive && (
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  Active Plan
                </Badge>
              )}
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
              {plan.meals.map((item, idx) => (
                <PlanMealRow
                  key={item.id}
                  name={item.name}
                  totalCalories={item.total_calories}
                  ingredientNames={item.meal_items.map((mi) => mi.food_item.name)}
                  accentIndex={idx}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 sm:flex sm:flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                className="w-full min-w-0 gap-1.5 sm:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPlan(plan);
                }}
              >
                <PencilLine size={14} />
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full min-w-0 gap-1.5 sm:w-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onOptimizePlan(plan);
                }}
              >
                <Sparkles size={14} />
                Make changes
              </Button>
              {isActive ? (
                <Button
                  variant="secondary"
                  className="col-span-3 min-w-0 sm:flex-1 sm:basis-0"
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
                  className="col-span-3 min-w-0 sm:flex-1 sm:basis-0"
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
