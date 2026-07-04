

export type UserProfile = {
  id?: string;
  name?: string;
  region?: string;
  fitness_goals?: string;
  dietary_restrictions?: string[];
  health_conditions?: string[];
  required_food_items?: string[];
  weight?: number; // kg 
  height?: number; 
  sex?: string;
  activity_level?: string; 
};

export type MealPlan = {
  total_protein: number, 
  total_carbs: number, 
  total_fats: number, 
  total_fibre: number, 
  total_calories: number
}