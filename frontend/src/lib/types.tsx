

export type UserProfile = {
  name?: string;
  region?: string;
  fitness_goals?: string;
  dietary_restrictions?: string[];
  health_conditions?: string[];
  required_food_items?: string[];
  weight: number; // kg 
};