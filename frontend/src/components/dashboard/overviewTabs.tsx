import { TabsContent } from "@/components/ui/tabs";
import { CalorieRingCard } from "@/components/dashboard/calorieRingCard";
import { MacrosCard } from "@/components/dashboard/macrosCard";
import { TodaysMealsCard } from "@/components/dashboard/todayMealsCards";
import { MealSkeleton } from "../MealSkeleton";
import type { FullPlanData } from "@/types/types";
import { NoActivePlanEmptyState } from "../emptyPlanStates";

export interface OverviewTabProps {
  activePlan: FullPlanData | null;
  toggleMeal: (mealID: number, planID: number) => void;
  getRecommended: () => void;
  loading: boolean
}

type MacroStat = {
  label: string;
  value: number;
  max: number;
  color: string;
};

function getNutritionSummary(activePlan: FullPlanData) {
  const completedMeals = activePlan.meal_plan_items.filter((meal) => meal.meal_completed);

  const consumedCalories = Number(completedMeals.reduce((sum, meal) => sum + meal.meal_data.total_calories, 0).toFixed(2));
  const consumedProtein = Number(completedMeals.reduce((sum, meal) => sum + meal.meal_data.total_protein, 0).toFixed(2));
  const consumedCarbs = Number(completedMeals.reduce((sum, meal) => sum + meal.meal_data.total_carbs, 0).toFixed(2));
  const consumedFat = Number(completedMeals.reduce((sum, meal) => sum + meal.meal_data.total_fats, 0).toFixed(2));
  const consumedFibre = Number(completedMeals.reduce((sum, meal) => sum + meal.meal_data.total_fibre, 0).toFixed(2));

  const goal = {
    calories: Number(activePlan.total_calories.toFixed(2)),
  };

  const consumed = {
    calories: consumedCalories,
  };

  const macros: MacroStat[] = [
    { label: "Protein", value: consumedProtein, max: Number(activePlan.total_protein.toFixed(2)), color: "#4f7eff" },
    { label: "Carbohydrates", value: consumedCarbs, max: Number(activePlan.total_carbs.toFixed(2)), color: "#34d399" },
    { label: "Fat", value: consumedFat, max: Number(activePlan.total_fats.toFixed(2)), color: "#f59e0b" },
    { label: "Fibre", value: consumedFibre, max: Number(activePlan.total_fibre.toFixed(2)), color: "white" },
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

  const { consumed, goal, macros } = getNutritionSummary(props.activePlan);

  return (
    <TabsContent value="overview" className="flex flex-col gap-4">
      <CalorieRingCard consumed={consumed} goal={goal} />
      <MacrosCard macros={macros} />
      <TodaysMealsCard
        activePlan={props.activePlan}
        toggleMeal={props.toggleMeal}
      />
    </TabsContent>
  );
}