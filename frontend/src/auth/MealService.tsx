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
        console.log("Error: marking user meal completed", error)
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
        console.log("Error: retrieving items in meal", error)
        return 
    }
    // data is collection of amount, food data.
    return data
}
