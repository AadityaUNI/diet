import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealRow} from "@/components/dashboard/mealRow";
import type { FullPlanData } from "@/types/types";
interface TodaysMealsCardProps {
  activePlan: FullPlanData;
  toggleMeal: (mealID: number, planID: number) => void 
}

export function TodaysMealsCard({ activePlan, toggleMeal }: TodaysMealsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Today's Meals</CardTitle>
            <Badge variant="secondary" className="text-sm">
              {activePlan.name.split("—")[0].trim()}
            </Badge>
          </div>
          {/* <span className="font-mono text-sm text-muted-foreground">
            {eaten.size}/{activePlan.meals.length} eaten
          </span> */}
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex flex-col">
          {activePlan.meal_plan_items.map((meal_item, idx) => {
            const mealData = meal_item.meal_data
            return(
            <MealRow
              key={mealData.id}
              mealData={mealData}
              eaten={meal_item.meal_completed}
              planID={activePlan.id as number}
              isLast={idx === activePlan.meal_plan_items.length - 1}
              onToggle={toggleMeal}
            />)
          }
          )}
        </div>
      </CardContent>
    </Card>
  );
}