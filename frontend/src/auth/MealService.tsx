import { supabase } from "@/lib/supabase";
import { SupabaseRequestError } from "@/lib/supabaseError";
import type { FoodItem } from "@/types/types";


export async function toggleUserMealCompletion(mealID: number, planID: number, state: boolean)
{
    const { error } = await supabase 
    .from("Meals")
    .update({"meal_completed": state})
    .eq("id", mealID)
    .eq("planID", planID)

    if (error)
    {
        throw new SupabaseRequestError("Unable to update this meal.", error)
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
        throw new SupabaseRequestError("Unable to load this meal's ingredients.", error)
    }
    // data is collection of amount, food data.
    return data
}

export async function fetchFoodCatalog(region: string) {
    const {data, error} = await supabase
    .from("FoodItems")
    .select("*")
    .or(`region.eq.GLOBAL,region.eq.${region}`)
    
    if (error)
    {
        throw new SupabaseRequestError("Unable to load the food list.", error)
    }

    // data is array of food items for the current region 
    return data as FoodItem[]
}

export async function createCustomFoodItem({
    name,
    calories,
    protein,
    carbs,
    fat,
    fibre,
    cup_serving,
    whole_serving,
    region,
    userID,
}: Omit<FoodItem, "id" | "created_at" | "added_by" | "region"> & { region: string; userID: string }) {
    const { data, error } = await supabase
        .from("FoodItems")
        .insert({ name, calories, protein, carbs, fat, fibre, cup_serving, whole_serving, region, added_by: userID })
        .select("*")
        .single()

    if (error) {
        throw new SupabaseRequestError("Unable to save this ingredient.", error)
    }

    return data as FoodItem
}
