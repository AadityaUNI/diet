import type { UserProfile } from "@/types/types"

export type CalorieGoal = "light_cut" | "heavy_cut" | "maintain" | "light_bulk" | "heavy_bulk"

export const CALORIE_GOAL_OPTIONS: Array<{
  value: CalorieGoal
  label: string
  description: string
}> = [
  { value: "light_cut", label: "Light cut", description: "Lose about 0.25 kg per week" },
  { value: "heavy_cut", label: "Heavy cut", description: "Lose about 0.5 kg per week" },
  { value: "maintain", label: "Maintain", description: "Keep your current weight steady" },
  { value: "light_bulk", label: "Light bulk", description: "Gain about 0.25 kg per week" },
  { value: "heavy_bulk", label: "Heavy bulk", description: "Gain about 0.5 kg per week" },
]

const ACTIVITY_MULTIPLIERS: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
}

const GOAL_ADJUSTMENTS: Record<string, number> = {
  cut: -275,
  light_cut: -275,
  heavy_cut: -550,
  maintain: 0,
  bulk: 275,
  light_bulk: 275,
  heavy_bulk: 550,
}

export function calculateCalorieTarget({ age, weight, height, sex, activity_level, fitness_goals }: Pick<UserProfile, "age" | "weight" | "height" | "sex" | "activity_level" | "fitness_goals">): number {
  const sexAdjustment = sex.toLowerCase() === "female" ? -161 : 5
  const bmr = 10 * weight + 6.25 * height - 5 * age + sexAdjustment
  const maintenance = bmr * (ACTIVITY_MULTIPLIERS[activity_level] ?? 1.2)
  const adjusted = maintenance + (GOAL_ADJUSTMENTS[fitness_goals] ?? 0)

  return Math.max(1200, Math.round(adjusted / 10) * 10)
}
