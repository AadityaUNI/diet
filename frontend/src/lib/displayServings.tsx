import type { MealItem } from "@/types/types";

export type ServingDisplayItem = {
  name: string;
  amount: number;
  cup_serving: number | null;
  whole_serving: number | null;
};

export function toServingDisplayItem(meal_item: MealItem | ServingDisplayItem): ServingDisplayItem {
  if (!("food_item" in meal_item)) return meal_item;
  return {
    name: meal_item.food_item.name,
    amount: meal_item.amount,
    cup_serving: meal_item.food_item.cup_serving,
    whole_serving: meal_item.food_item.whole_serving,
  };
}

// Drops trailing zeros so 2.0 reads as "2" and 1.50 as "1.5".
export function formatQuantity(value: number, digits = 1) {
  return Number(value.toFixed(digits)).toString();
}

export function servingEquivalents({ amount, cup_serving, whole_serving }: ServingDisplayItem) {
  const servings: string[] = [];

  if (cup_serving) {
    const cups = formatQuantity(amount / cup_serving);
    if (cups !== "0") servings.push(`${cups} ${cups === "1" ? "cup" : "cups"}`);
  }

  if (whole_serving) {
    const pieces = formatQuantity(amount / whole_serving);
    if (pieces !== "0") servings.push(`${pieces} ${pieces === "1" ? "piece" : "pieces"}`);
  }

  return servings;
}
