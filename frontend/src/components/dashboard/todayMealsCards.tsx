import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MealRow} from "@/components/dashboard/mealRow";
import { AddTemporaryMealDialog } from "@/components/dashboard/addTemporaryMealDialog";
import type { HydratedMeals } from "@/types/plan-editor";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FullPlanData } from "@/types/types";
interface TodaysMealsCardProps {
  activePlan: FullPlanData;
  toggleMeal: (mealID: number) => void;
  onCreateTemporaryMeal: (meal: HydratedMeals[number]) => Promise<boolean>;
  onDeleteTemporaryMeal: (mealID: number) => void;
}

export function TodaysMealsCard({ activePlan, toggleMeal, onCreateTemporaryMeal, onDeleteTemporaryMeal }: TodaysMealsCardProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const regularMeals = activePlan.meals.filter((meal) => !meal.temp_meal);
  const temporaryMeals = activePlan.meals.filter((meal) => meal.temp_meal);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col items-start gap-2">
          <div className="flex w-full items-center justify-between gap-3">
            <CardTitle>Today's Meals</CardTitle>
            <Button type="button" variant="secondary" size="sm" className="shrink-0 gap-1.5" onClick={() => setAddDialogOpen(true)}>
              <Plus size={14} /> Add extra
            </Button>
          </div>
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
          {regularMeals.map((mealData, idx) => {
            return(
            <MealRow
              key={mealData.id}
              mealData={mealData}
              eaten={mealData.meal_completed}
              isLast={idx === regularMeals.length - 1 && temporaryMeals.length === 0}
              accentIndex={idx}
              onToggle={toggleMeal}
            />)
          }
          )}
          {temporaryMeals.length > 0 && (
            <div className="mt-5 border-t border-border/70 pt-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Extras</h3>
                  <p className="text-xs text-muted-foreground">Additional meals for today</p>
                </div>
              </div>
              {temporaryMeals.map((mealData, idx) => (
                <MealRow
                  key={mealData.id}
                  mealData={mealData}
                  eaten={mealData.meal_completed}
                  isLast={idx === temporaryMeals.length - 1}
                  accentIndex={regularMeals.length + idx}
                  onToggle={toggleMeal}
                  onDelete={onDeleteTemporaryMeal}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <AddTemporaryMealDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreate={onCreateTemporaryMeal}
      />
    </Card>
  );
}