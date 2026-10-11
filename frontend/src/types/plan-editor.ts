import type { FullPlanData } from "@/types/types";

export type PlanEditorMode = "create" | "edit";
export type ServingUnit = "grams" | "cups" | "pieces";

export type PlanIngredientDraft = {
  id: number;
  name: string;
  amount: string;
  calories: number;
  carbs: number;
  fat: number;
  fibre: number;
  protein: number;
  cup_serving: number | null;
  whole_serving: number | null;
  servingUnit: ServingUnit;
};

export type TotalMacros = {
  total_calories: number;
  total_carbs: number;
  total_fats: number;
  total_fibre: number;
  total_protein: number;
}

export type HydratedMeals = (PlanMealDraft & TotalMacros)[];

export type PlanMealDraft = {
  id: number;
  name: string;
  ingredients: PlanIngredientDraft[];
};

export type PlanEditorDraft = {
  id: number;
  name: string;
  meals: PlanMealDraft[];
};

export function servingFactor(ingredient: Pick<PlanIngredientDraft, "cup_serving" | "whole_serving"> & { servingUnit?: ServingUnit }) {
  if (ingredient.servingUnit === "cups") return ingredient.cup_serving;
  if (ingredient.servingUnit === "pieces") return ingredient.whole_serving;
  return 1;
}

export function gramsForIngredient(ingredient: { amount: string | number; cup_serving: number | null; whole_serving: number | null; servingUnit?: ServingUnit }) {
  const quantity = Number(ingredient.amount);
  const factor = servingFactor(ingredient);
  return Number.isFinite(quantity) && quantity > 0 && factor && factor > 0 ? quantity * factor : 0;
}

export function quantityFromGrams(grams: number, unit: ServingUnit, cupServing: number | null, wholeServing: number | null) {
  const factor = unit === "cups" ? cupServing : unit === "pieces" ? wholeServing : 1;
  return factor && factor > 0 ? grams / factor : grams;
}

function createIngredientDraft(name = "", amount = "", fat = 0, fibre = 0, calories = 0, protein = 0, carbs = 0, cup_serving = null, whole_serving = null) {
  return {
    id: -1,
    name,
    amount,
    fat,
    fibre,
    calories,
    protein,
    carbs,
    cup_serving,
    whole_serving,
    servingUnit: "grams" as ServingUnit,
  } satisfies PlanIngredientDraft;
}

function createMealDraft(name = "Meal", ingredientCount = 1) {
  return {
    id: -1,
    name,
    ingredients: Array.from({ length: ingredientCount }, () => createIngredientDraft()),
  } satisfies PlanMealDraft;
}

export function createEmptyPlanDraft(): PlanEditorDraft {
  return {
    id: -1,
    name: "",
    meals: [createMealDraft()],
  };
}


export function planDraftFromSavedPlan(plan: FullPlanData): PlanEditorDraft {
  return {
    id: plan.id,
    name: plan.name,
    meals: plan.meals.filter((meal) => !meal.temp_meal).map((meal) => ({
      id: meal.id,
      name: meal.name,
      ingredients: meal.meal_items.map((mealItem) => ({
        id: mealItem.foodID,
        name: mealItem.food_item.name,
        amount: String(mealItem.amount),
        fibre: mealItem.food_item.fibre,
        fat: mealItem.food_item.fat,
        calories: mealItem.food_item.calories,
        protein: mealItem.food_item.protein,
        carbs: mealItem.food_item.carbs,
        cup_serving: mealItem.food_item.cup_serving,
        whole_serving: mealItem.food_item.whole_serving,
        servingUnit: "grams",
      })),
    })),
  };
}

export function createBlankMealDraft() {
  return createMealDraft();
}

export function createBlankIngredientDraft() {
  return createIngredientDraft();
}