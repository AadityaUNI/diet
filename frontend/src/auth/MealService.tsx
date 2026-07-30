import { supabase } from "@/lib/supabase";

export async function toggleUserMealCompletion(mealID: number, planID: number, state: boolean)
{
    const { error } = await supabase 
    .from("MealPlanItems")
    .update({"meal_completed": state})
    .eq("mealID", mealID)
    .eq("planID", planID)

    if (error)
    {
        return
    }
}

export async function getItemsInMeal(mealID: number)
{
    const { data, error } = await supabase 
    .from("MealItems")
    .select("amount, foodItems: FoodItems!inner(*)")
    .eq("mealID", mealID)

    if (error)
    {
        return 
    }
    // data is collection of amount, food data.
    return data
}
