import type { FullPlanData } from "@/types/types";

export type PlanEditorMode = "create" | "edit";

export type PlanIngredientDraft = {
  id: number;
  name: string;
  amount: string;
  calories: number;
  carbs: number;
  fat: number;
  fibre: number;
  protein: number;
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


function createIngredientDraft(name = "", amount = "", fat = 0, fibre = 0, calories = 0, protein = 0, carbs = 0) {
  return {
    id: -1,
    name,
    amount,
    fat, 
    fibre, 
    calories,
    protein, 
    carbs
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
    meals: plan.meals.map((meal) => ({
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