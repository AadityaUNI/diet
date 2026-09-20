import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { FoodCommandSelect } from "@/components/foodCommandSelect";
import { useFoodCatalog } from "@/hooks/useFoodCatalog";
import { useAuth } from "@/auth/AuthContext";
import { hydrateDraft } from "@/lib/hydratePlanDraft";
import type { FoodItem } from "@/types/types";
import type { PlanEditorDraft } from "@/types/plan-editor";

type MobilePlanEditorProps = {
  mode: "create" | "edit";
  draft: PlanEditorDraft;
  onChange: (draft: PlanEditorDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
  saveError?: string | null;
};

type Step = "details" | "count" | "meal";

function updateMeal(draft: PlanEditorDraft, mealIndex: number, updater: (meal: PlanEditorDraft["meals"][number]) => PlanEditorDraft["meals"][number]) {
  return {
    ...draft,
    meals: draft.meals.map((meal, index) => (index === mealIndex ? updater(meal) : meal)),
  };
}

function updateIngredient(
  draft: PlanEditorDraft,
  mealIndex: number,
  ingredientIndex: number,
  updater: (ingredient: PlanEditorDraft["meals"][number]["ingredients"][number]) => PlanEditorDraft["meals"][number]["ingredients"][number],
) {
  return updateMeal(draft, mealIndex, (meal) => ({
    ...meal,
    ingredients: meal.ingredients.map((ingredient, index) =>
      index === ingredientIndex ? updater(ingredient) : ingredient,
    ),
  }));
}

function formatMacro(value: number, unit = "g") {
  return `${value.toFixed(0)}${unit}`;
}

export function MobilePlanEditor({
  mode,
  draft,
  onChange,
  onSave,
  onCancel,
  saving = false,
  saveError,
}: MobilePlanEditorProps) {
  const { data: foods = [], isLoading: foodsLoading } = useFoodCatalog();
  const { user } = useAuth();
  const [step, setStep] = useState<Step>("details");
  const [mealIndex, setMealIndex] = useState(0);
  const [mealCount, setMealCount] = useState(draft.meals.length);
  const [goingForward, setGoingForward] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalSteps = draft.meals.length + 2;
  const currentStep = step === "details" ? 0 : step === "count" ? 1 : mealIndex + 2;
  const hydrated = hydrateDraft(draft);
  const meal = draft.meals[mealIndex];
  const hydratedMeal = hydrated.hydrated_meals[mealIndex];

  function moveTo(nextStep: Step, forward: boolean, nextMealIndex = mealIndex) {
    setGoingForward(forward);
    setMealIndex(nextMealIndex);
    setStep(nextStep);
    setError(null);
  }

  function reconcileMeals(count: number) {
    const meals = [...draft.meals];
    while (meals.length < count) {
      meals.push({
        id: -1,
        name: `Meal ${meals.length + 1}`,
        ingredients: [],
      });
    }
    onChange({ ...draft, meals: meals.slice(0, count) });
  }

  function selectFood(food: FoodItem, ingredientIndex: number) {
    onChange(updateIngredient(draft, mealIndex, ingredientIndex, (ingredient) => ({
      ...ingredient,
      id: food.id,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fibre: food.fibre,
    })));
  }

  function validateMeal() {
    if (!meal.name.trim()) return "Give this meal a name first.";
    if (meal.ingredients.length === 0) return "Add at least one ingredient.";
    if (meal.ingredients.some((ingredient) => !ingredient.name || Number(ingredient.amount) <= 0)) {
      return "Choose an ingredient and enter a positive amount for each row.";
    }
    return null;
  }

  function next() {
    if (step === "details") {
      if (!draft.name.trim()) {
        setError("Give your plan a name first.");
        return;
      }
      moveTo("count", true);
      return;
    }

    if (step === "count") {
      if (mealCount < 1 || mealCount > 10) {
        setError("Choose between 1 and 10 meals.");
        return;
      }
      if (mealCount < draft.meals.length && !window.confirm("Remove the extra meals from this plan?")) {
        return;
      }
      reconcileMeals(mealCount);
      moveTo("meal", true, 0);
      return;
    }

    const mealError = validateMeal();
    if (mealError) {
      setError(mealError);
      return;
    }
    if (mealIndex < draft.meals.length - 1) {
      moveTo("meal", true, mealIndex + 1);
    } else {
      onSave();
    }
  }

  function back() {
    if (step === "details") {
      onCancel();
    } else if (step === "count") {
      moveTo("details", false);
    } else if (mealIndex > 0) {
      moveTo("meal", false, mealIndex - 1);
    } else {
      moveTo("count", false);
    }
  }

  const title = step === "details" ? "Name your plan" : step === "count" ? "How many meals?" : meal.name || `Meal ${mealIndex + 1}`;
  const description = step === "details"
    ? "A name makes this plan easy to find later."
    : step === "count"
      ? "You can move between meals before saving."
      : "Add foods and adjust their portions.";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-lg flex-col px-4 pb-6 pt-5">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Button variant="ghost" size="icon" onClick={back} aria-label="Go back">
          <ArrowLeft />
        </Button>
        <div className="flex-1">
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>
        <span className="min-w-14 text-right text-xs tabular-nums text-muted-foreground">
          {currentStep + 1} / {totalSteps}
        </span>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden border-border/70 bg-card/85 shadow-lg shadow-primary/5">
        <CardHeader className="space-y-1 px-5 pb-3 pt-5">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {mode === "edit" ? "Edit plan" : "New plan"}
          </p>
          <CardTitle className="text-2xl leading-tight">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>

        <CardContent
          key={`${step}-${mealIndex}`}
          className={`flex flex-1 flex-col gap-5 px-5 pb-5 pt-3 animate-in fade-in-0 duration-300 ${goingForward ? "slide-in-from-right-8" : "slide-in-from-left-8"}`}
        >
          {step === "details" && (
            <div className="space-y-2">
              <Label htmlFor="mobile-plan-name">Plan name</Label>
              <Input
                id="mobile-plan-name"
                autoFocus
                value={draft.name}
                onChange={(event) => onChange({ ...draft, name: event.target.value })}
                placeholder="My weekly plan"
              />
            </div>
          )}

          {step === "count" && (
            <div className="space-y-2">
              <Label htmlFor="mobile-meal-count">Number of meals</Label>
              <Input
                id="mobile-meal-count"
                autoFocus
                type="number"
                min="1"
                max="10"
                value={mealCount}
                onChange={(event) => setMealCount(Number(event.target.value))}
              />
              <p className="text-xs text-muted-foreground">Choose 1 to 10 meals.</p>
            </div>
          )}

          {step === "meal" && meal && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={`mobile-meal-name-${mealIndex}`}>Meal name</Label>
                <Input
                  id={`mobile-meal-name-${mealIndex}`}
                  autoFocus
                  value={meal.name}
                  onChange={(event) => onChange(updateMeal(draft, mealIndex, (current) => ({ ...current, name: event.target.value })))}
                  placeholder="Breakfast"
                />
              </div>

              <div className="rounded-2xl border border-border/70 bg-muted/35 p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Ingredients</p>
                    <p className="text-xs text-muted-foreground">Search, add, then set grams.</p>
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">{meal.ingredients.length} items</span>
                </div>

                <div className="space-y-2">
                  {meal.ingredients.map((ingredient, ingredientIndex) => (
                    <div key={`${mealIndex}-${ingredientIndex}`} className="space-y-2 rounded-xl border border-border/60 bg-background/75 p-2">
                      <div className="flex items-center gap-2">
                        <FoodCommandSelect
                          value={ingredient.name}
                          foods={foods}
                          isLoading={foodsLoading}
                          currentUserId={user?.id}
                          onSelect={(food) => selectFood(food, ingredientIndex)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${ingredient.name || "ingredient"}`}
                          onClick={() => onChange(updateMeal(draft, mealIndex, (current) => ({
                            ...current,
                            ingredients: current.ingredients.filter((_, index) => index !== ingredientIndex),
                          })))}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                      <div className="relative">
                        <Input
                          aria-label={`${ingredient.name || "Ingredient"} amount in grams`}
                          type="number"
                          min="1"
                          value={ingredient.amount}
                          onChange={(event) => onChange(updateIngredient(draft, mealIndex, ingredientIndex, (current) => ({
                            ...current,
                            amount: event.target.value,
                          })))}
                          placeholder="Amount"
                          className="pr-8"
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">g</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  className="mt-3 w-full gap-2"
                  onClick={() => onChange(updateMeal(draft, mealIndex, (current) => ({
                    ...current,
                    ingredients: [...current.ingredients, { id: -1, name: "", amount: "", calories: 0, carbs: 0, fat: 0, fibre: 0, protein: 0 }],
                  })))}
                >
                  <Plus />
                  Add ingredient
                </Button>
              </div>

              {hydratedMeal && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-primary/10 px-2 py-2"><p className="text-sm font-semibold">{formatMacro(hydratedMeal.total_calories, "")}</p><p className="text-[10px] uppercase text-muted-foreground">kcal</p></div>
                  <div className="rounded-xl bg-primary/10 px-2 py-2"><p className="text-sm font-semibold">{formatMacro(hydratedMeal.total_protein)}</p><p className="text-[10px] uppercase text-muted-foreground">protein</p></div>
                  <div className="rounded-xl bg-primary/10 px-2 py-2"><p className="text-sm font-semibold">{formatMacro(hydratedMeal.total_carbs)}</p><p className="text-[10px] uppercase text-muted-foreground">carbs</p></div>
                </div>
              )}
            </div>
          )}

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}

          <div className="mt-auto flex gap-2 pt-3">
            <Button variant="secondary" onClick={back} className="flex-1 gap-2">
              <ArrowLeft /> Back
            </Button>
            <Button onClick={next} disabled={saving} className="flex-1 gap-2">
              {step === "meal" && mealIndex === draft.meals.length - 1 ? <Save /> : <ArrowRight />}
              {saving ? "Saving..." : step === "meal" && mealIndex === draft.meals.length - 1 ? "Save plan" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}