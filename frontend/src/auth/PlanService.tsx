import { supabase } from "@/lib/supabase";
import type {FullPlanData, MealData} from "@/types/types";
import type { GeneratedMeal, GeneratedPlan } from "@/types/generated-plan";


export async function getAllFoodData(userID: string)
{
    console.log("Calling food data function with : ", userID)
    const {data, error} = await supabase 
    .from("MealPlans")
    .select(`*, 
        meal_plan_items: MealPlanItems!inner(*,
        meal_data: Meals!inner(*, 
        meal_items: MealItems!inner(*, 
        food_item: FoodItems!inner(*)
        )))
        `)
    .eq("userID", userID)

    if (error)
    {
        console.log("Error: getting all user food data", error)
        return null 
    }

    // data : [mealPlans[]], mealPlans -> meals[] -> meal_completed, mealData[] -> foodItem[]
    console.log("Returned data: ", data)
    return data as FullPlanData[]
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
        const {error} = await supabase
        .from("UserProfiles")
        .update({active_meal_plan_id: null})
        .eq("id", userID)
        
        if (error)
        {
            console.log("Error: setting user active plan to null", error)
            return 
        }
    }
}

export async function addUserPlan(mealPlan: MealData, userID: string)
{
    const {error} = await supabase 
    .from("MealPlans")
    .insert([{...mealPlan, userID: userID}])

    if (error)
    {
        console.log("Error: adding user meal plan", error)
    }
}

export async function createMealPlan(plan: GeneratedPlan, userID: string)
{
    const planInsert = {
        name: plan.name,
        total_calories: plan.total_calories,
        total_carbs: plan.total_carbs,
        total_fats: plan.total_fats,
        total_fibre: plan.total_fibre,
        total_protein: plan.total_protein,
        userID,
    };

    const { data: insertedPlan, error: planError } = await supabase
        .from("MealPlans")
        .insert([planInsert])
        .select("id")
        .single();

    if (planError || !insertedPlan) {
        console.log("Error: creating recommended plan", planError)
        return null;
    }

    return insertedPlan.id;
}

export async function createMeal(meal: GeneratedMeal, userID: string)
{
    const mealInsert = {
        name: meal.name,
        total_calories: meal.total_calories,
        total_carbs: meal.total_carbs,
        total_fats: meal.total_fats,
        total_fibre: meal.total_fibre,
        total_protein: meal.total_protein,
        userID,
    };

    const { data: insertedMeal, error: mealError } = await supabase
        .from("Meals")
        .insert([mealInsert])
        .select("id")
        .single();

    if (mealError || !insertedMeal) {
        console.log("Error: creating recommended meal", mealError)
        return null;
    }

    return insertedMeal.id;
}

export async function createMealPlanItem(mealID: number, planID: number)
{
    const { error } = await supabase
        .from("MealPlanItems")
        .insert([
            {
                mealID,
                planID,
                meal_completed: false,
            },
        ]);

    if (error) {
        console.log("Error: linking recommended meal to plan", error)
        return false;
    }

    return true;
}

export async function createMealItems(meal: GeneratedMeal, mealID: number, userID: string)
{
    if (meal.ingredients.length === 0) {
        return true;
    }
    console.log("INGREDIENTS: ", meal.ingredients)
    const mealItems = meal.ingredients.map((ingredient) => ({
        amount: ingredient.amount,
        foodID: ingredient.id,
        mealID,
        userID,
    }));

    const { error } = await supabase
        .from("MealItems")
        .insert(mealItems);

    if (error) {
        console.log("Error: creating recommended meal items", error)
        return false;
    }

    return true;
}

export async function createUserPlan(plan: GeneratedPlan, userID: string)
{
    const planID = await createMealPlan(plan, userID);

    if (!planID) {
        return null;
    }

    for (const meal of plan.meals) {
        const mealID = await createMeal(meal, userID);

        if (!mealID) {
            return null;
        }

        const mealPlanItemSaved = await createMealPlanItem(mealID, planID);

        if (!mealPlanItemSaved) {
            return null;
        }

        const mealItemsSaved = await createMealItems(meal, mealID, userID);

        if (!mealItemsSaved) {
            return null;
        }
    }

    return planID;
}

export async function changeUserActivePlan(userID: string, planID: number | null)
{
    const {error} = await supabase
    .from("UserProfiles")
    .update({"active_meal_plan_id": planID})
    .eq("id", userID)

    if (error)
    {
        console.log("Error: marking user plan active", error)
    }
}