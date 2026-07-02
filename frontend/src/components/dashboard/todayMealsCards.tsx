import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealRow, type Meal } from "@/components/dashboard/mealRow";

interface TodaysMealsCardProps {
  activePlanName: string;
  activeMeals: Meal[];
  eatenIds: Set<string>;
  toggleMeal: (id: string) => void;
}

export function TodaysMealsCard({ activePlanName, activeMeals, eatenIds, toggleMeal }: TodaysMealsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>Today's Meals</CardTitle>
            <Badge variant="secondary" className="text-sm">
              {activePlanName.split("—")[0].trim()}
            </Badge>
          </div>
          <span className="font-mono text-sm text-muted-foreground">
            {eatenIds.size}/{activeMeals.length} eaten
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex flex-col">
          {activeMeals.map((meal, idx) => (
            <MealRow
              key={meal.id}
              meal={meal}
              eaten={eatenIds.has(meal.id)}
              isLast={idx === activeMeals.length - 1}
              onToggle={toggleMeal}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}