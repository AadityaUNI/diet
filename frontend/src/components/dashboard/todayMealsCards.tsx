import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealRow} from "@/components/dashboard/mealRow";
import type { FullPlanData } from "@/types/types";
interface TodaysMealsCardProps {
  activePlan: FullPlanData;
  toggleMeal: (mealID: number) => void 
}

export function TodaysMealsCard({ activePlan, toggleMeal }: TodaysMealsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start gap-2">
          <CardTitle>Today's Meals</CardTitle>
          <div className="min-w-0 max-w-full">
            <Badge variant="secondary" className="h-auto max-w-full overflow-visible whitespace-normal break-words px-2 py-1 text-left text-sm leading-snug">
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
          {activePlan.meals.map((mealData, idx) => {
            return(
            <MealRow
              key={mealData.id}
              mealData={mealData}
              eaten={mealData.meal_completed}
              isLast={idx === activePlan.meals.length - 1}
              accentIndex={idx}
              onToggle={toggleMeal}
            />)
          }
          )}
        </div>
      </CardContent>
    </Card>
  );
}