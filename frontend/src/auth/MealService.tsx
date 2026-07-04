import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import type { MealPlan } from "@/lib/types";
export async function getUserActivePlan(id: string)
{
    const {data, error} = await supabase 
    .from("UserProfiles")
    .select(`*, 
        activeMeal: MealPlans!active_meal_plan_id(*)`)
    .eq("id", id)
    
    if (error)
    {
        console.log("Error: getting user active plan", error)
        return;
    }
    return data 
}

export async function getAllUserPlans(id: string)
{
    const {data, error} = await supabase 
    .from("MealPlans")
    .select("*")
    .eq("userID", id)

    if (error)
    {
        console.log("Error: getting all user plans", error)
        return 
    }
    return data
}

export async function deleteUserPlan(planID: number, isActive: boolean, userID: string)
{
    // if isActive then set userProfile active meal to null 

    const { error } = await supabase
    .from("MealPlans")
    .delete()
    .eq("id", planID)
    .eq("userID", userID)

    if (error)
    {
        console.log("Error: deleting user plan", error)
        return 
    }

    if (isActive)
    {
        const {data, error} = await supabase
        .from("UserProfiles")
        .update({active_meal_plan_id: null})
        .eq("userID", userID)
        
        if (error)
        {
            console.log("Error: setting user active plan to null", error)
            return 
        }
    }
}

export async function addUserPlan(mealPlan: MealPlan, userID: string)
{
    const {data, error} = await supabase 
    .from("MealPlans")
    .insert([{...mealPlan, userID: userID}])

    if (error)
    {
        console.log("Error: adding user meal plan", error)
    }
}

export async function markUserPlanActive(userID: string, mealID: number)
{
    const {data, error} = await supabase
    .from("UserProfiles")
    .update({"active_meal_plan_id": mealID})
    .eq("id", userID)

    if (error)
    {
        console.log("Error: marking user plan active", error)
    }
}