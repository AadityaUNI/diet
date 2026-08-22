// Mirrors the JSON schema Gemini is instructed to return in main.py's
// call_gemini() prompt. Deliberately NOT unified with FullPlanData /
// MealData — a generated plan hasn't been saved yet, so it has no id,
// planID, meal_completed, or FK-linked FoodItem.
// Once a plan is saved, the backend response for that save action should
// come back as (or be mapped to) FullPlanData — this type is purely for the
// pre-save preview returned by POST /recommend.

export type Goal = "cut" | "bulk" | "light_cut" | "heavy_cut" | "maintain" | "light_bulk" | "heavy_bulk";
export type View = "form" | "loading" | "results" | "error";

export type GeneratedIngredient = {
  id: number;
  name: string;
  amount: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  fibre: number;
};

export type GeneratedMeal = {
  name: string;
  total_calories: number;
  total_protein: number;
  total_fats: number;
  total_carbs: number;
  total_fibre: number;
  ingredients: GeneratedIngredient[];
};

export type GeneratedPlan = {
  name: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  total_fibre: number;
  meals: GeneratedMeal[];
};

export type RecommendResponse = {
  skipped_items: string[];
  plans: GeneratedPlan[];
};

// Request body for POST /recommend. main.py's ConstraintInput pydantic model
// is currently empty (`pass`), so this is inferred from the fields the
// prompt string in call_gemini() actually reads off `constraints`.
// Update this if/when ConstraintInput gets real fields on the backend.
export type RecommendConstraints = {
  fitness_goal: string;
  age: number;
  sex: string;
  height: number;
  weight: number;
  activity_level: string;
  health_conditions: string[];
  required_food_items: string[];
  dietary_restrictions: string[];
  region: string;
};
