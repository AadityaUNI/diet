import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  PlanEditorDraft,
  PlanEditorMode,
  PlanIngredientDraft,
  PlanMealDraft,
} from "@/types/plan-editor";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { FoodCommandSelect } from "@/components/foodCommandSelect";
import { hydrateDraft } from "@/lib/hydratePlanDraft";
import { createCustomFoodItem } from "@/auth/MealService";
import { useAuth } from "@/auth/AuthContext";
import type { FoodItem } from "@/types/types";

type PlanEditorProps = {
  mode: PlanEditorMode;
  draft: PlanEditorDraft;
  onChange: (draft: PlanEditorDraft) => void;
  onAddMeal: () => void;
  onRemoveMeal: (mealId: number) => void;
  onAddIngredient: (mealId: number) => void;
  onRemoveIngredient: (mealId: number, ingredientId: number) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
};

function updateMeal(draft: PlanEditorDraft, mealId: number, updater: (meal: PlanMealDraft) => PlanMealDraft) {
  return {
    ...draft,
    meals: draft.meals.map((meal) => (meal.id === mealId ? updater(meal) : meal)),
  };
}

function updateIngredient(
  meal: PlanMealDraft,
  ingredientId: number,
  updater: (ingredient: PlanIngredientDraft) => PlanIngredientDraft,
) {
  return {
    ...meal,
    ingredients: meal.ingredients.map((ingredient) =>
      ingredient.id === ingredientId ? updater(ingredient) : ingredient,
    ),
  };
}

function MacroCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/30 px-3 py-2">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

type CustomFoodForm = {
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fibre: string;
};

const emptyCustomFoodForm: CustomFoodForm = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
  fibre: "",
};


export function PlanEditor({
  mode,
  draft,
  onChange,
  onAddMeal,
  onRemoveMeal,
  onAddIngredient,
  onRemoveIngredient,
  onSave,
  onCancel,
  saving = false,
}: PlanEditorProps) {
  const { data: foods = [], isLoading: foodsLoading } = useFoodCatalog();
  const { user, region } = useAuth();
  const queryClient = useQueryClient();
  const [customFoodOpen, setCustomFoodOpen] = useState(false);
  const [customFoodForm, setCustomFoodForm] = useState<CustomFoodForm>(emptyCustomFoodForm);
  const [customFoodTarget, setCustomFoodTarget] = useState<{ mealId: number; ingredientId: number } | null>(null);

  const customFoodMutation = useMutation({
    mutationFn: () => createCustomFoodItem({
      name: customFoodForm.name.trim(),
      calories: Number(customFoodForm.calories),
      protein: Number(customFoodForm.protein),
      carbs: Number(customFoodForm.carbs),
      fat: Number(customFoodForm.fat),
      fibre: Number(customFoodForm.fibre),
      region,
      userID: user!.id,
    }),
    onSuccess: (food) => {
      selectFoodForTarget(food);
      queryClient.invalidateQueries({ queryKey: ["food-catalog", region] });
      setCustomFoodForm(emptyCustomFoodForm);
      setCustomFoodOpen(false);
    },
  });

  const {hydrated_meals, total_macros} = hydrateDraft(draft)

  const { total_calories, total_protein, total_carbs, total_fats, total_fibre } = total_macros;

  function selectFoodForTarget(food: FoodItem) {
    if (!customFoodTarget) {
      return;
    }

    onChange({
      ...updateMeal(draft, customFoodTarget.mealId, (current) => updateIngredient(
        current,
        customFoodTarget.ingredientId,
        (ingredient) => ({
          ...ingredient,
          name: food.name,
          id: food.id,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fibre: food.fibre,
        }),
      )),
    });
  }

  function openCustomFoodDialog(mealId: number, ingredientId: number) {
    setCustomFoodTarget({ mealId, ingredientId });
    setCustomFoodOpen(true);
  }

  const customFoods = foods.filter((food) => food.added_by === user?.id);

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 pb-28">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {mode === "edit" ? "Edit plan" : "Create plan"}
            </p>
            <h1 className="mt-1 text-2xl font-bold leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              {mode === "edit" ? "Refine an existing plan" : "Build your own plan"}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Keep the meal structure simple for now. Ingredients are captured as name and amount,
              while the macro totals stay visible for later wiring.
            </p>
          </div>

          <Button variant="ghost" onClick={onCancel} className="shrink-0 gap-2">
            <ArrowLeft size={16} />
            Back
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="flex flex-col gap-6">
            <Card className="border-border/70 bg-card/80 backdrop-blur">
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="plan-name">Plan name</Label>
                  <Input
                    id="plan-name"
                    value={draft.name}
                    onChange={(event) => onChange({ ...draft, name: event.target.value })}
                    placeholder="My weekly strength plan"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">Meals</h2>
                    <p className="text-sm text-muted-foreground">Add the meals that make up the plan.</p>
                  </div>
                  <Button type="button" variant="secondary" onClick={onAddMeal} className="gap-2">
                    <Plus size={14} />
                    Add meal
                  </Button>
                </div>

                <div className="flex flex-col gap-4">
                  {hydrated_meals.map((meal, mealIndex) => (
                    <Card key={meal.id} className="border-border/70 bg-background/60">
                      <CardContent className="space-y-4 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <div className="space-y-2">
                              <Label htmlFor={`meal-${meal.id}`}>Meal {mealIndex + 1}</Label>
                              <Input
                                id={`meal-${meal.id}`}
                                value={meal.name}
                                onChange={(event) =>
                                  onChange(
                                    updateMeal(draft, meal.id, (current) => ({
                                      ...current,
                                      name: event.target.value,
                                    })),
                                  )
                                }
                                placeholder="Breakfast, lunch, dinner..."
                              />
                            </div>

                            <p className="mt-2 text-xs text-muted-foreground">
                              {meal.total_calories.toFixed(0)} cal · {meal.total_protein.toFixed(1)} g protein · {meal.total_carbs.toFixed(1)} g carbs · {meal.total_fats.toFixed(1)} g fat · {meal.total_fibre.toFixed(1)} g fibre
                            </p>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemoveMeal(meal.id)}
                            disabled={draft.meals.length === 1}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Ingredients</p>
                            <Button
                              
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => onAddIngredient(meal.id)}
                              className="gap-2"
                            >
                              <Plus size={13} />
                              Add ingredient
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="grid grid-cols-[minmax(0,1fr)_120px_40px] gap-2 text-xs text-muted-foreground">
                              <span>Name</span>
                              <span>Amount</span>
                              <span />
                            </div>

                            {meal.ingredients.map((ingredient) => (
                              <div
                                key={ingredient.id}
                                className="grid grid-cols-[minmax(0,1fr)_120px_40px] gap-2"
                              >
                                <FoodCommandSelect
                                  value={ingredient.name}
                                  foods={foods}
                                  isLoading={foodsLoading}
                                  currentUserId={user?.id}
                                  onSelect={(food) =>
                                    onChange(updateMeal(draft, meal.id, (current) =>
                                      updateIngredient(current, ingredient.id, (currentIngredient) => ({
                                        ...currentIngredient,
                                        name: food.name,
                                        id: food.id,
                                        calories: food.calories,
                                        protein: food.protein,
                                        carbs: food.carbs,
                                        fat: food.fat,
                                        fibre: food.fibre,
                                      })),
                                    ))
                                  }
                                  onCreateCustom={() => openCustomFoodDialog(meal.id, ingredient.id)}
                                />
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min="0"
                                    value={ingredient.amount}
                                    onChange={(event) =>
                                      onChange(
                                        updateMeal(draft, meal.id, (current) => ({
                                          ...updateIngredient(current, ingredient.id, (currentIngredient) => ({
                                            ...currentIngredient,
                                            amount: String(Math.abs(Number(event.target.value))),
                                          })),
                                        })),
                                      )
                                    }
                                    placeholder="Amount"
                                    className="pr-7"
                                  />
                                  <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">g</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => onRemoveIngredient(meal.id, ingredient.id)}
                                  disabled={meal.ingredients.length === 1}
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={onSave} className="gap-2 sm:flex-1" disabled={saving}>
                <Save size={16} />
                {saving ? "Saving..." : mode === "edit" ? "Save changes" : "Create plan"}
              </Button>
              <Button variant="secondary" onClick={onCancel} className="sm:flex-1">
                Cancel
              </Button>
            </div>
          </div>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-6 lg:self-start">
            <Card className="bg-muted dark:bg-secondary">
              <CardContent className="space-y-4 p-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Macro summary</p>
                  <p className="mt-1 text-sm text-muted-foreground">Visible now, wired up later.</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <MacroCard label="Calories" value={`${total_calories.toFixed(2)}`} />
                  <MacroCard label="Protein" value={`${total_protein.toFixed(2)} g`} />
                  <MacroCard label="Carbs" value={`${total_carbs.toFixed(2)} g`} />
                  <MacroCard label="Fat" value={`${total_fats.toFixed(2)} g`} />
                  <MacroCard label="Fibre" value={`${total_fibre.toFixed(2)} g`} />
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      <Dialog open={customFoodOpen} onOpenChange={setCustomFoodOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom ingredients</DialogTitle>
            <DialogDescription>
              Use one of your saved foods or add a new one. Macro values are per 100 g.
            </DialogDescription>
          </DialogHeader>

          {customFoods.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Saved by you</p>
              <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
                {customFoods.map((food) => (
                  <Button
                    key={food.id}
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-between gap-3 px-3 py-2 text-left"
                    onClick={() => {
                      selectFoodForTarget(food);
                      setCustomFoodOpen(false);
                    }}
                  >
                    <span className="min-w-0 truncate">{food.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{food.calories.toFixed(0)} kcal</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!customFoodForm.name.trim() || !region || !user || Object.values(customFoodForm).slice(1).some((value) => value === "" || Number(value) < 0)) {
                return;
              }
              customFoodMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="custom-food-name">Ingredient name</Label>
              <Input
                id="custom-food-name"
                value={customFoodForm.name}
                onChange={(event) => setCustomFoodForm({ ...customFoodForm, name: event.target.value })}
                placeholder="e.g. Homemade granola"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {([
                ["calories", "Calories", "kcal"],
                ["protein", "Protein", "g"],
                ["carbs", "Carbs", "g"],
                ["fat", "Fat", "g"],
                ["fibre", "Fibre", "g"],
              ] as const).map(([key, label, unit]) => (
                <div className="space-y-2" key={key}>
                  <Label htmlFor={`custom-food-${key}`}>{label}</Label>
                  <div className="relative">
                    <Input
                      id={`custom-food-${key}`}
                      type="number"
                      min="0"
                      step="0.1"
                      value={customFoodForm[key]}
                      onChange={(event) => setCustomFoodForm({ ...customFoodForm, [key]: event.target.value })}
                      className="pr-8"
                      required
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">{unit}</span>
                  </div>
                </div>
              ))}
            </div>
            {customFoodMutation.error && <p className="text-sm text-destructive">Could not save this ingredient. Please try again.</p>}
            <DialogFooter>
              <Button type="submit" disabled={customFoodMutation.isPending}>
                {customFoodMutation.isPending ? "Saving..." : "Save and use ingredient"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}