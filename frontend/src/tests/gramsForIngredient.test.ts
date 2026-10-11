import { describe, expect, it } from "vitest"
import { gramsForIngredient } from "@/types/plan-editor"

const ingredient = (overrides: Partial<Parameters<typeof gramsForIngredient>[0]> = {}) => ({
  amount: "100",
  cup_serving: 240,
  whole_serving: 50,
  ...overrides,
})

describe("gramsForIngredient", () => {
  it("returns the amount as grams when the unit is grams", () => {
    expect(gramsForIngredient(ingredient({ amount: "150", servingUnit: "grams" }))).toBe(150)
  })

  it("defaults to grams when no unit is given", () => {
    expect(gramsForIngredient(ingredient({ amount: "150" }))).toBe(150)
  })

  it("converts cups to grams using cup_serving", () => {
    expect(gramsForIngredient(ingredient({ amount: "1.5", servingUnit: "cups" }))).toBe(360)
  })

  it("converts pieces to grams using whole_serving", () => {
    expect(gramsForIngredient(ingredient({ amount: "3", servingUnit: "pieces" }))).toBe(150)
  })

  it("accepts numeric amounts as well as strings", () => {
    expect(gramsForIngredient(ingredient({ amount: 2, servingUnit: "cups" }))).toBe(480)
  })

  it.each(["", "0", "-5", "abc", "Infinity"])("returns 0 for an invalid amount %j", (amount) => {
    expect(gramsForIngredient(ingredient({ amount }))).toBe(0)
  })

  it("returns 0 for cups when the food has no cup_serving", () => {
    expect(gramsForIngredient(ingredient({ amount: "2", servingUnit: "cups", cup_serving: null }))).toBe(0)
  })

  it("returns 0 for pieces when the food has no whole_serving", () => {
    expect(gramsForIngredient(ingredient({ amount: "2", servingUnit: "pieces", whole_serving: null }))).toBe(0)
  })

  it("returns 0 when the serving size is 0 or negative", () => {
    expect(gramsForIngredient(ingredient({ amount: "2", servingUnit: "cups", cup_serving: 0 }))).toBe(0)
    expect(gramsForIngredient(ingredient({ amount: "2", servingUnit: "pieces", whole_serving: -10 }))).toBe(0)
  })
})
