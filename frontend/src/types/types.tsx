export type UserProfile = {
  active_meal_plan_id: number | null;
  activity_level: string;
  dietary_restrictions: string[]
  fitness_goals: string;
  health_conditions: string[]
  height: number | string;
  id: string;
  name: string;
  region: string;
  required_food_items: string[]
  sex: string;
  age: number | string;
  weight: number | string;
};

export type NormalizedUserProf = {
  active_meal_plan_id: number | null;
  activity_level: string;
  dietary_restrictions: string[]
  fitness_goals: string;
  health_conditions: string[]
  height: number;
  id: string;
  name: string;
  region: string;
  required_food_items: string[]
  sex: string;
  age: number;
  weight: number;
}

export type NormalizedUpdate = {
  name?: string;
  region?: string;
  fitness_goals?: string;
  dietary_restrictions?: string[];
  health_conditions?: string[];
  required_food_items?: string[];
  weight?: number; // kg
  age?: number;
  height?: number;
  sex?: string;
  activity_level?: string;
}


export type UpdateUserProfile = {
  name?: string;
  region?: string;
  fitness_goals?: string;
  dietary_restrictions?: string[];
  health_conditions?: string[];
  required_food_items?: string[];
  weight?: number | string; // kg
  age?: number | string;
  height?: number | string;
  sex?: string;
  activity_level?: string;
};

export type FullPlanData = {
  id: number;
  name: string;
  total_calories: number;
  total_carbs: number;
  total_fats: number;
  total_fibre: number;
  total_protein: number;
  userID: string;
  meals: MealData[]
};

export type MealData = {
  id: number;
  name: string;
  total_calories: number;
  total_carbs: number;
  total_fats: number;
  total_fibre: number;
  total_protein: number;
  planID: number;
  meal_completed: boolean;
  meal_items: {
    amount: number;
    foodID: number;
    mealID: number;
    food_item: FoodItem;
  }[];
};

export type FoodItem = {
  added_by: string | null;
  calories: number;
  carbs: number;
  created_at: string;
  fat: number;
  fibre: number;
  id: number;
  name: string;
  protein: number;
  region: string;
};

