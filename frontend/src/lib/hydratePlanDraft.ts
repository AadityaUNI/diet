import type { PlanEditorDraft } from "@/types/plan-editor";

function scale(macro: number | null, amount: number | null)
{
  if (!macro || !amount) return 0;
  return macro*amount/100;
}

export function hydrateDraft(draft: PlanEditorDraft)
{
    const hydrated_meals = draft.meals.map((meal) => {
        const meal_macros = meal.ingredients.reduce((acc, ing) => {
        acc.total_calories += scale(ing.calories, ing.amount)
        acc.total_protein += scale(ing.protein, ing.amount);
        acc.total_carbs += scale(ing.carbs, ing.amount);
        acc.total_fats += scale(ing.fat, ing.amount);
        acc.total_fibre += scale(ing.fibre, ing.amount);
        return acc;
        }, { total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0, total_fibre: 0 });
    return {...meal, ...meal_macros};
  })


  const total_macros = hydrated_meals.reduce((acc, meal) => {
    acc.total_calories += meal.total_calories ?? 0;
    acc.total_protein += meal.total_protein ?? 0;
    acc.total_carbs += meal.total_carbs ?? 0;
    acc.total_fats += meal.total_fats ?? 0;
    acc.total_fibre += meal.total_fibre ?? 0;
    return acc;
  }, { total_calories: 0, total_protein: 0, total_carbs: 0, total_fats: 0, total_fibre: 0 });

  return {hydrated_meals: hydrated_meals, total_macros: total_macros};
}