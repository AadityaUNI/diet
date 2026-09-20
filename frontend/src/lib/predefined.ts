export const ACTIVITY_LEVELS = [
                  { value: "sedentary",    label: "Sedentary",         desc: "Little or no exercise, desk job" },
                  { value: "light",        label: "Lightly Active",    desc: "Light exercise or housework 1–3 days/week" },
                  { value: "moderate",     label: "Moderately Active", desc: "Moderate exercise 3–5 days/week" },
                  { value: "very_active",  label: "Very Active",       desc: "Hard exercise 6–7 days/week" },
                  { value: "extra_active", label: "Extra Active",      desc: "Very hard exercise + physical job" },
                ];

export type MacroPreset = "balanced" | "keto" | "maintain"

export const MACRO_PRESETS: Array<{
  value: MacroPreset
  label: string
  description: string
  getTargets: (calories: number, weightLbs: number) => { protein: number; fat: number; fibre: number; carbs: number }
}> = [
  {
    value: "balanced",
    label: "Balanced Performance",
    description: "High carb, lower fat - optimized for performance and muscle retention",
    getTargets: (calories, weightLbs) => {
      const protein = weightLbs * 1; // 1g per lb
      const fat = (calories * 0.25) / 9; // 25% of calories from fat
      const fibre = (calories / 1000) * 14; // 14g per 1000 calories
      const fatCalories = fat * 9;
      const proteinCalories = protein * 4;
      const remainingCalories = calories - fatCalories - proteinCalories;
      const carbs = remainingCalories / 4;
      return { protein, fat, fibre, carbs };
    }
  },
  {
    value: "keto",
    label: "Ketogenic",
    description: "Very low carb, high fat - for rapid fat burning and ketosis",
    getTargets: (calories, weightLbs) => {
      const protein = weightLbs * 1.2; // Slightly higher protein for keto
      const fat = (calories * 0.70) / 9; // 70% of calories from fat
      const fibre = (calories / 1000) * 12; // Slightly lower fibre for keto
      const fatCalories = fat * 9;
      const proteinCalories = protein * 4;
      const remainingCalories = calories - fatCalories - proteinCalories;
      const carbs = Math.max(0, remainingCalories / 4); // Ensure non-negative
      return { protein, fat, fibre, carbs };
    }
  },
  {
    value: "maintain",
    label: "Maintain Health",
    description: "Moderate macros - not gymming focused, general health maintenance",
    getTargets: (calories, weightLbs) => {
      const protein = weightLbs * 0.8; // 0.8g per lb for maintenance
      const fat = (calories * 0.30) / 9; // 30% of calories from fat
      const fibre = (calories / 1000) * 14; // Standard fibre recommendation
      const fatCalories = fat * 9;
      const proteinCalories = protein * 4;
      const remainingCalories = calories - fatCalories - proteinCalories;
      const carbs = remainingCalories / 4;
      return { protein, fat, fibre, carbs };
    }
  }
];