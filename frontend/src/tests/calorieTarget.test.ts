import { describe, expect, it } from "vitest"
import { calculateCalorieTarget } from "@/lib/calorieTarget"

describe("calculateCalorieTarget", () => {
  it("calculates a light cut from BMR, activity, and weekly rate", () => {
    expect(calculateCalorieTarget({
      age: 28,
      weight: 68,
      height: 175,
      sex: "Male",
      activity_level: "moderate",
      fitness_goals: "light_cut",
    })).toBe(2270)
  })

  it("keeps targets within a reasonable minimum", () => {
    expect(calculateCalorieTarget({
      age: 90,
      weight: 40,
      height: 140,
      sex: "Female",
      activity_level: "sedentary",
      fitness_goals: "heavy_cut",
    })).toBe(1200)
  })
})