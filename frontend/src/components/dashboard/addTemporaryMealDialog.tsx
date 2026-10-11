import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FoodCommandSelect } from "@/components/plan/foodCommandSelect";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { useAuth } from "@/auth/AuthContext";
import { createBlankIngredientDraft, createBlankMealDraft, type PlanIngredientDraft, type PlanMealDraft } from "@/types/plan-editor";
import { hydrateDraft } from "@/lib/hydratePlanDraft";
import type { FoodItem } from "@/types/types";
import type { HydratedMeals } from "@/types/plan-editor";

type AddTemporaryMealDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (meal: HydratedMeals[number]) => Promise<boolean>;
};

function updateIngredient(meal: PlanMealDraft, ingredientId: number, updater: (ingredient: PlanIngredientDraft) => PlanIngredientDraft) {
  return {
    ...meal,
    ingredients: meal.ingredients.map((ingredient) =>
      ingredient.id === ingredientId ? updater(ingredient) : ingredient,
    ),
  };
}

function createTemporaryMealDraft() {
  return { ...createBlankMealDraft(), name: "Extra meal" };
}

export function AddTemporaryMealDialog({ open, onOpenChange, onCreate }: AddTemporaryMealDialogProps) {
  const { data: foods = [], isLoading: foodsLoading } = useFoodCatalog();
  const { user } = useAuth();
  const [meal, setMeal] = useState<PlanMealDraft>(createTemporaryMealDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setMeal(createTemporaryMealDraft());
      setError(null);
    }
    onOpenChange(nextOpen);
  };

  const hydratedMeal = hydrateDraft({ id: -1, name: "", meals: [meal] }).hydrated_meals[0];
  const hasValidIngredients = meal.ingredients.length > 0 && meal.ingredients.every(
    (ingredient) => ingredient.id > 0 && Number(ingredient.amount) > 0,
  );

  const selectFood = (ingredientId: number, food: FoodItem) => {
    setMeal((current) => updateIngredient(current, ingredientId, (ingredient) => ({
      ...ingredient,
      name: food.name,
      id: food.id,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fibre: food.fibre,
    })));
  };

  const handleCreate = async () => {
    if (!hasValidIngredients) {
      setError("Choose a food and enter an amount for each ingredient.");
      return;
    }

    setSaving(true);
    setError(null);
    const created = await onCreate(hydratedMeal);
    setSaving(false);

    if (created) {
      handleOpenChange(false);
    } else {
      setError("Unable to add this temporary meal. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="inset-0 flex h-dvh max-h-none w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none p-0 sm:inset-auto sm:left-1/2 sm:top-1/2 sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-4xl sm:p-6">
        <DialogHeader className="border-b border-border/70 px-5 py-5 sm:border-0 sm:px-0 sm:py-0">
          <DialogTitle>Add temporary meal</DialogTitle>
          <DialogDescription>Add something extra to today&apos;s active plan. It will stay here until you delete it.</DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-0 sm:py-5">
          <div className="space-y-2">
            <Label htmlFor="temporary-meal-name">Meal name</Label>
            <Input
              id="temporary-meal-name"
              className="h-12 text-base"
              value={meal.name}
              onChange={(event) => setMeal((current) => ({ ...current, name: event.target.value }))}
              placeholder="Extra meal"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Ingredients</p>
                <p className="text-xs text-muted-foreground">Use the same food catalog as your plan.</p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-10 gap-1.5"
                onClick={() => setMeal((current) => ({ ...current, ingredients: [...current.ingredients, createBlankIngredientDraft()] }))}
              >
                <Plus size={13} /> Add ingredient
              </Button>
            </div>

            <div className="space-y-2">
              {meal.ingredients.map((ingredient, index) => (
                <div key={ingredient.id} className="space-y-3 rounded-2xl border border-border/70 bg-secondary/20 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Ingredient {index + 1}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Remove ingredient ${index + 1}`}
                      onClick={() => setMeal((current) => current.ingredients.length > 1
                        ? { ...current, ingredients: current.ingredients.filter((item) => item.id !== ingredient.id) }
                        : current)}
                      disabled={meal.ingredients.length === 1}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                  <FoodCommandSelect
                    value={ingredient.name}
                    foods={foods}
                    isLoading={foodsLoading}
                    currentUserId={user?.id}
                    onSelect={(food) => selectFood(ingredient.id, food)}
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor={`temporary-ingredient-${ingredient.id}`} className="text-xs text-muted-foreground">Amount</Label>
                    <div className="relative">
                      <Input
                        id={`temporary-ingredient-${ingredient.id}`}
                        type="number"
                        min="0"
                        className="h-11 pr-8 text-base"
                        value={ingredient.amount}
                        onChange={(event) => setMeal((current) => updateIngredient(current, ingredient.id, (currentIngredient) => ({
                          ...currentIngredient,
                          amount: event.target.value,
                        })))}
                        placeholder="Amount"
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-secondary/30 p-4 text-sm sm:grid-cols-5">
            <span><strong>{hydratedMeal.total_calories.toFixed(0)}</strong> kcal</span>
            <span><strong>{hydratedMeal.total_protein.toFixed(1)}g</strong> P</span>
            <span><strong>{hydratedMeal.total_carbs.toFixed(1)}g</strong> C</span>
            <span><strong>{hydratedMeal.total_fats.toFixed(1)}g</strong> F</span>
            <span><strong>{hydratedMeal.total_fibre.toFixed(1)}g</strong> fibre</span>
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter className="border-t border-border/70 bg-background px-5 py-4 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)} className="h-11 sm:h-9">Cancel</Button>
          <Button type="button" onClick={handleCreate} disabled={saving} className="h-11 gap-2 sm:h-9">
            <Plus size={15} /> {saving ? "Adding..." : "Add temporary meal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
