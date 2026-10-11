import { describe, expect, it } from "vitest"
import { MACRO_PRESETS, type MacroPreset } from "@/lib/predefined"

const getTargets = (preset: MacroPreset, calories: number, weightLbs: number) => {
  const config = MACRO_PRESETS.find(p => p.value === preset)
  if (!config) throw new Error(`Missing preset: ${preset}`)
  return config.getTargets(calories, weightLbs)
}

const totalCalories = ({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) =>
  protein * 4 + carbs * 4 + fat * 9

describe("MACRO_PRESETS", () => {
  it("defines the balanced, keto, and maintain presets", () => {
    expect(MACRO_PRESETS.map(p => p.value)).toEqual(["balanced", "keto", "maintain"])
  })

  it("balanced: 0.8g protein per lb, 25% fat, 14g fibre per 1000 kcal, carbs fill the rest", () => {
    const targets = getTargets("balanced", 2000, 150)
    expect(targets.protein).toBeCloseTo(120)
    expect(targets.fat).toBeCloseTo(55.56, 1)
    expect(targets.fibre).toBeCloseTo(28)
    expect(targets.carbs).toBeCloseTo(255)
  })

  it("keto: 1g protein per lb, 70% fat, 12g fibre per 1000 kcal, carbs fill the rest", () => {
    const targets = getTargets("keto", 2500, 150)
    expect(targets.protein).toBeCloseTo(150)
    expect(targets.fat).toBeCloseTo(194.44, 1)
    expect(targets.fibre).toBeCloseTo(30)
    expect(targets.carbs).toBeCloseTo(37.5)
  })

  it("maintain: 0.8g protein per lb, 30% fat, 14g fibre per 1000 kcal, carbs fill the rest", () => {
    const targets = getTargets("maintain", 2000, 150)
    expect(targets.protein).toBeCloseTo(120)
    expect(targets.fat).toBeCloseTo(66.67, 1)
    expect(targets.fibre).toBeCloseTo(28)
    expect(targets.carbs).toBeCloseTo(230)
  })

  it.each([
    ["balanced", 2000, 150],
    ["balanced", 3000, 200],
    ["keto", 2500, 150],
    ["maintain", 1800, 130],
    ["maintain", 2600, 190],
  ] as const)("%s at %i kcal / %i lb: macros add up to the calorie target", (preset, calories, weightLbs) => {
    expect(totalCalories(getTargets(preset, calories, weightLbs))).toBeCloseTo(calories)
  })

  it.each(["balanced", "keto"] as const)("%s never returns negative carbs when protein and fat exceed the calorie target", (preset) => {
    expect(getTargets(preset, 1200, 300).carbs).toBe(0)
  })

  it("protein scales with body weight, not calories", () => {
    for (const { value } of MACRO_PRESETS) {
      expect(getTargets(value, 2000, 150).protein).toBeCloseTo(getTargets(value, 3000, 150).protein)
      expect(getTargets(value, 2000, 200).protein).toBeGreaterThan(getTargets(value, 2000, 150).protein)
    }
  })

  it("fat and fibre scale linearly with calories", () => {
    for (const { value } of MACRO_PRESETS) {
      const low = getTargets(value, 2000, 150)
      const high = getTargets(value, 4000, 150)
      expect(high.fat).toBeCloseTo(low.fat * 2)
      expect(high.fibre).toBeCloseTo(low.fibre * 2)
    }
  })
})
