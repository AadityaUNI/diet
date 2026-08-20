import { supabase } from "@/lib/supabase";
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
        console.log("Error updating meal completion", error)
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
        console.log("Error fetching items for meal", error)
        return 
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
        console.log("Error fetching food catalog", error)
        return 
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
    region,
    userID,
}: Omit<FoodItem, "id" | "created_at" | "added_by" | "region"> & { region: string; userID: string }) {
    const { data, error } = await supabase
        .from("FoodItems")
        .insert({ name, calories, protein, carbs, fat, fibre, region, added_by: userID })
        .select("*")
        .single()

    if (error) {
        throw error
    }

    return data as FoodItem
}
