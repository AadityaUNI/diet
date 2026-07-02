import { TabsContent } from "@/components/ui/tabs";
import { CalorieRingCard } from "@/components/dashboard/calorieRingCard";
import { MacrosCard } from "@/components/dashboard/macrosCard";
import { TodaysMealsCard } from "@/components/dashboard/todayMealsCards";
import type { Meal } from "@/components/dashboard/mealRow";

interface OverviewTabProps {
  consumed: { calories: number };
  goal: { calories: number };
  radius: number;
  circumference: number;
  ringMacros: { label: string; value: number; max: number; color: string }[];
  macros: { label: string; value: number; max: number; color: string }[];
  activePlanName: string;
  activeMeals: Meal[];
  eatenIds: Set<string>;
  toggleMeal: (id: string) => void;
}

export function OverviewTab(props: OverviewTabProps) {
  return (
    <TabsContent value="overview" className="flex flex-col gap-4">
      <CalorieRingCard consumed={props.consumed} goal={props.goal} radius={props.radius} circumference={props.circumference} />
      <MacrosCard ringMacros={props.ringMacros} macros={props.macros} />
      <TodaysMealsCard
        activePlanName={props.activePlanName}
        activeMeals={props.activeMeals}
        eatenIds={props.eatenIds}
        toggleMeal={props.toggleMeal}
      />
    </TabsContent>
  );
}