import type { PlanEditorDraft, PlanIngredientDraft } from "@/types/plan-editor";

export const empty_draft: PlanEditorDraft = {id: 1, name: "", meals: []};
export const expected_empty = {hydrated_meals: [], total_macros: { total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0, total_fibre: 0 }};

// macros are per 100g and amounts are in grams
function ingredient(id: number, name: string, amount: string, calories: number, protein: number, carbs: number, fat: number, fibre: number): PlanIngredientDraft {
    return { id, name, amount, calories, protein, carbs, fat, fibre, cup_serving: null, whole_serving: null, servingUnit: "grams" };
}

const meal_1_ingredients = [
    ingredient(0, "apple", "100", 100, 100, 100, 100, 100),
    ingredient(1, "", "0", 100, 100, 100, 100, 100),
];

const meal_2_ingredients = [
    ingredient(0, "mango", "50", 50.6, 10.6, 0, 0, 0),
    ingredient(1, "", "50.5", 100, 100, 100, 100, 100),
];

export const general_draft: PlanEditorDraft = {
    id: 10,
    name: "General",
    meals: [
        { id: 1, name: "", ingredients: meal_1_ingredients },
        { id: 2, name: "", ingredients: meal_2_ingredients },
    ],
};

export const expected_general =
{
  hydrated_meals: [
    {
      id: 1,
      name: "",
      ingredients: meal_1_ingredients,
      total_calories: 100,
      total_protein: 100,
      total_carbs: 100,
      total_fats: 100,
      total_fibre: 100
    },
    {
      id: 2,
      name: "",
      ingredients: meal_2_ingredients,
      total_calories: 75.8,
      total_protein: 55.8,
      total_carbs: 50.5,
      total_fats: 50.5,
      total_fibre: 50.5
    }
  ],
  total_macros: {
    total_calories: 175.8,
    total_protein: 155.8,
    total_carbs: 150.5,
    total_fats: 150.5,
    total_fibre: 150.5
  }
};
