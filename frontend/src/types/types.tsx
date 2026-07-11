export type UserProfile = {
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
};


export type UpdateUserProfile = {
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
  meal_plan_items: MealPlanItems[]
};

export type MealPlanItems = {
   meal_completed: boolean;
    mealID: number;
    planID: number;
    meal_data: MealData;
}

export type MealData = {
  id: number;
  name: string;
  total_calories: number;
  total_carbs: number;
  total_fats: number;
  total_fibre: number;
  total_protein: number;
  userID: string;
  meal_items: {
    amount: number;
    foodID: number;
    mealID: number;
    userID: string;
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

