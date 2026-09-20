import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CalorieRingCard } from "@/components/dashboard/calorieRingCard";
import { MacrosCard } from "@/components/dashboard/macrosCard";
import { TodaysMealsCard } from "@/components/dashboard/todayMealsCards";
import { MealSkeleton } from "../MealSkeleton";
import type { FullPlanData } from "@/types/types";
import { NoActivePlanEmptyState } from "../emptyPlanStates";
import { PencilLine, Sparkles } from "lucide-react";

export interface OverviewTabProps {
  activePlan: FullPlanData | null;
  toggleMeal: (mealID: number) => void;
  getRecommended: () => void;
  loading: boolean
  onEditPlan: (plan: FullPlanData) => void;
  onOptimizePlan: (plan: FullPlanData) => void;
  calorieTarget: number | null;
  macroGoals?: {
    protein_target?: number;
    carbs_target?: number;
    fat_target?: number;
    fiber_target?: number;
  };
}

type MacroStat = {
  label: string;
  value: number;
  max: number;
  color: string;
  planAmount?: number;
};

function getNutritionSummary(activePlan: FullPlanData, calorieTarget: number | null, macroGoals?: {
  protein_target?: number;
  carbs_target?: number;
  fat_target?: number;
  fiber_target?: number;
}) {
  const completedMeals = activePlan.meals.filter((meal) => meal.meal_completed);

  const consumedCalories = Number(completedMeals.reduce((sum, meal) => sum + meal.total_calories, 0).toFixed(2));
  const consumedProtein = Number(completedMeals.reduce((sum, meal) => sum + meal.total_protein, 0).toFixed(2));
  const consumedCarbs = Number(completedMeals.reduce((sum, meal) => sum + meal.total_carbs, 0).toFixed(2));
  const consumedFat = Number(completedMeals.reduce((sum, meal) => sum + meal.total_fats, 0).toFixed(2));
  const consumedFibre = Number(completedMeals.reduce((sum, meal) => sum + meal.total_fibre, 0).toFixed(2));

  const goal = {
    calories: calorieTarget ?? Number(activePlan.total_calories.toFixed(2)),
    planCalories: Number(activePlan.total_calories.toFixed(2)),
  };

  const consumed = {
    calories: consumedCalories,
  };

  // Use macro goals if available, otherwise fall back to plan totals
  const macros: MacroStat[] = [
    { 
      label: "Protein", 
      value: consumedProtein, 
      max: macroGoals?.protein_target ?? Number(activePlan.total_protein.toFixed(2)), 
      planAmount: macroGoals?.protein_target ? Number(activePlan.total_protein.toFixed(2)) : undefined,
      color: "var(--chart-1)" 
    },
    { 
      label: "Carbohydrates", 
      value: consumedCarbs, 
      max: macroGoals?.carbs_target ?? Number(activePlan.total_carbs.toFixed(2)), 
      planAmount: macroGoals?.carbs_target ? Number(activePlan.total_carbs.toFixed(2)) : undefined,
      color: "var(--chart-2)" 
    },
    { 
      label: "Fat", 
      value: consumedFat, 
      max: macroGoals?.fat_target ?? Number(activePlan.total_fats.toFixed(2)), 
      planAmount: macroGoals?.fat_target ? Number(activePlan.total_fats.toFixed(2)) : undefined,
      color: "var(--chart-3)" 
    },
    { 
      label: "Fibre", 
      value: consumedFibre, 
      max: macroGoals?.fiber_target ?? Number(activePlan.total_fibre.toFixed(2)), 
      planAmount: macroGoals?.fiber_target ? Number(activePlan.total_fibre.toFixed(2)) : undefined,
      color: "var(--chart-4)" 
    },
  ];

  return { consumed, goal, macros };
}


export function OverviewTab(props: OverviewTabProps) {

  if (props.loading)
  {
    return (
    <TabsContent value="overview" className="flex flex-col gap-4">
    <MealSkeleton />
    </TabsContent>)
  }

  if (!props.activePlan)
  {
    return (
    <TabsContent value="overview" className="flex flex-col gap-4">
    <NoActivePlanEmptyState onGetRecommended={props.getRecommended} />
    </TabsContent>)
  }

  const { consumed, goal, macros } = getNutritionSummary(props.activePlan, props.calorieTarget, props.macroGoals);

  return (
    <TabsContent value="overview" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-outfit text-base font-bold">Today</h2>
          <p className="text-xs text-muted-foreground">Track and refine the active plan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => props.onEditPlan(props.activePlan!)}>
            <PencilLine size={14} />
            Edit plan
          </Button>
          <Button variant="secondary" size="sm" className="gap-1.5" onClick={() => props.onOptimizePlan(props.activePlan!)}>
            <Sparkles size={14} />
            Make changes
          </Button>
        </div>
      </div>
      <CalorieRingCard consumed={consumed} goal={goal} />
      <MacrosCard macros={macros} />
      <TodaysMealsCard
        activePlan={props.activePlan}
        toggleMeal={props.toggleMeal}
      />
    </TabsContent>
  );
}