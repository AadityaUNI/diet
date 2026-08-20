import { supabase } from "@/lib/supabase";
import type { FullPlanData, MealData } from "@/types/types";
import type { GeneratedMeal, GeneratedPlan } from "@/types/generated-plan";
import type { HydratedMeals, PlanEditorDraft, TotalMacros } from "@/types/plan-editor";

type HydratedMeal = HydratedMeals[number];

async function insertMealItems(meal: GeneratedMeal | HydratedMeal, mealID: number)
{
    if (meal.ingredients.length === 0) {
        return true;
    }

    const mealItems = meal.ingredients.map((ingredient) => ({
        amount: ingredient.amount ?? 0,
        foodID: ingredient.id,
        mealID
    }));

    const { error } = await supabase
        .from("MealItems")
        .insert(mealItems);

    return !error;
}

export async function getAllFoodData(userID: string)
{
    const { data, error } = await supabase
        .from("MealPlans")
        .select(`*, 
            meals: Meals!inner(*,
            meal_items: MealItems!inner(*,
            food_item: FoodItems!inner(*)))
        `)
        .eq("userID", userID);

    if (error)
    {
        console.log("Error fetching meal plan data for user", error)
        return null;
    }

    return data as FullPlanData[];
}

export async function deleteUserPlan(planID: number, isActive: boolean, userID: string)
{
    const { data: meals, error: mealsError } = await supabase
        .from("Meals")
        .select("id")
        .eq("planID", planID);

    if (mealsError)
    {
        console.log("Error selecting meals for plan", mealsError)
        return;
    }

    const mealIDs = (meals ?? []).map((meal) => meal.id);

    if (mealIDs.length > 0)
    {
        const { error: mealItemsError } = await supabase
            .from("MealItems")
            .delete()
            .in("mealID", mealIDs);

        if (mealItemsError)
        {
              console.log("Error deleting meal items for plan", mealItemsError)
            return;
        }

        const { error: mealsDeleteError } = await supabase
            .from("Meals")
            .delete()
            .eq("planID", planID);

        if (mealsDeleteError)
        {
              console.log("Error deleting meals for plan", mealsDeleteError)
            return;
        }
    }

    const { error } = await supabase
        .from("MealPlans")
        .delete()
        .eq("id", planID)
        .eq("userID", userID);

    if (error)
    {
           console.log("Error deleting meal plan", error)
        return;
    }

    if (isActive)
    {
        const { error: updateError } = await supabase
            .from("UserProfiles")
            .update({ active_meal_plan_id: null })
            .eq("id", userID);

        if (updateError)
        {
              console.log("Error clearing active meal plan on user profile", updateError)
            return;
        }
    }
}

// export async function addUserPlan(mealPlan: MealData, userID: string)
// {
//     const { error } = await supabase
//         .from("MealPlans")
//         .insert([{
//             name: mealPlan.name,
//             total_calories: mealPlan.total_calories,
//             total_carbs: mealPlan.total_carbs,
//             total_fats: mealPlan.total_fats,
//             total_fibre: mealPlan.total_fibre,
//             total_protein: mealPlan.total_protein,
//             userID,
//         }]);

//     if (error)
//     {
//         return;
//     }
// }

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
        return null;
    }

    return insertedPlan.id;
}

export async function createMeal(meal: GeneratedMeal, planID: number)
{
    const mealInsert = {
        name: meal.name,
        total_calories: meal.total_calories,
        total_carbs: meal.total_carbs,
        total_fats: meal.total_fats,
        total_fibre: meal.total_fibre,
        total_protein: meal.total_protein,
        planID,
        meal_completed: false,
    };

    const { data: insertedMeal, error: mealError } = await supabase
        .from("Meals")
        .insert([mealInsert])
        .select("id")
        .single();

    if (mealError || !insertedMeal) {
        return null;
    }

    return insertedMeal.id;
}

export async function createUserPlanFromAI(plan: GeneratedPlan, userID: string)
{
    const planID = await createMealPlan(plan, userID);

    if (!planID) {
        return null;
    }

    for (const meal of plan.meals) {
        const mealID = await createMeal(meal, planID);

        if (!mealID) {
            return null;
        }

        const mealItemsSaved = await insertMealItems(meal, mealID);

        if (!mealItemsSaved) {
            return null;
        }
    }

    return planID;
}

export async function changeUserActivePlan(userID: string, planID: number | null)
{
    const { error } = await supabase
        .from("UserProfiles")
        .update({ active_meal_plan_id: planID })
        .eq("id", userID);

    if (error)
    {
        return;
    }
}

export async function editUserPlan(planID: number, draft: PlanEditorDraft, hydrated_meals: HydratedMeals, total_macros: TotalMacros)
{
    const { data: planRow, error: planRowError } = await supabase
        .from("MealPlans")
        .select("userID")
        .eq("id", planID)
        .single();

    if (planRowError || !planRow)
    {
        console.log("Error fetching plan row", planRowError)
        return;
    }

    const { error: updatePlanError } = await supabase
        .from("MealPlans")
        .update({ ...total_macros, name: draft.name })
        .eq("id", planID);

    if (updatePlanError)
    {
        console.log("Error updating meal plan", updatePlanError)
        return;
    }

    const { data: currentMeals, error: currentMealsError } = await supabase
        .from("Meals")
        .select("id")
        .eq("planID", planID);

    if (currentMealsError)
    {
        console.log("Error fetching current meals for plan", currentMealsError)
        return;
    }

    const currentMealIDs = (currentMeals ?? []).map((meal) => meal.id);
    const draftMealIDs = draft.meals.map((meal) => meal.id).filter((mealID) => mealID > 0);
    const removedMealIDs = currentMealIDs.filter((mealID) => !draftMealIDs.includes(mealID));

    if (removedMealIDs.length > 0)
    {
        const { error: deleteRemovedItemsError } = await supabase
            .from("MealItems")
            .delete()
            .in("mealID", removedMealIDs);

        if (deleteRemovedItemsError)
        {
              console.log("Error deleting removed meal items", deleteRemovedItemsError)
            return;
        }

        const { error: deleteRemovedMealsError } = await supabase
            .from("Meals")
            .delete()
            .in("id", removedMealIDs)
            .eq("planID", planID);

        if (deleteRemovedMealsError)
        {
              console.log("Error deleting removed meals", deleteRemovedMealsError)
            return;
        }
    }

    const savedMealIDs: number[] = [];

    for (let index = 0; index < draft.meals.length; index += 1)
    {
        const meal = draft.meals[index];
        const hydratedMeal = hydrated_meals[index];

        if (!hydratedMeal)
        {
            return;
        }

        if (meal.id > 0)
        {
            const { error: updateMealError } = await supabase
                .from("Meals")
                .update({
                    name: hydratedMeal.name,
                    total_calories: hydratedMeal.total_calories,
                    total_carbs: hydratedMeal.total_carbs,
                    total_fats: hydratedMeal.total_fats,
                    total_fibre: hydratedMeal.total_fibre,
                    total_protein: hydratedMeal.total_protein,
                    planID,
                })
                .eq("id", meal.id)
                .eq("planID", planID);

            if (updateMealError)
            {
                 console.log("Error updating meal", updateMealError)
                return;
            }

            savedMealIDs.push(meal.id);
            continue;
        }

        const mealID = await createMeal(hydratedMeal, planID);

        if (!mealID)
        {
              console.log("Error creating meal", mealID)
            return;
        }

        savedMealIDs.push(mealID);
    }

    if (savedMealIDs.length > 0)
    {
        const { error: deleteCurrentItemsError } = await supabase
            .from("MealItems")
            .delete()
            .in("mealID", savedMealIDs);

        if (deleteCurrentItemsError)
        {
              console.log("Error deleting current meal items", deleteCurrentItemsError)
            return;
        }

        for (let index = 0; index < savedMealIDs.length; index += 1)
        {
            const mealItemsSaved = await insertMealItems(hydrated_meals[index], savedMealIDs[index]);

            if (!mealItemsSaved)
            {
                 console.log("Failed to insert meal items", mealItemsSaved)
                return;
            }
        }
    }
}

export async function createCustomUserPlan(draft: PlanEditorDraft, userID: string, hydrated_meals: HydratedMeals, total_macros: TotalMacros)
{
    const planInsert = {
        name: draft.name,
        total_calories: total_macros.total_calories,
        total_carbs: total_macros.total_carbs,
        total_fats: total_macros.total_fats,
        total_fibre: total_macros.total_fibre,
        total_protein: total_macros.total_protein,
        userID,
    };

    const { data: insertedPlan, error: planError } = await supabase
        .from("MealPlans")
        .insert([planInsert])
        .select("id")
        .single();

    if (planError || !insertedPlan) {
        return null;
    }

    for (let index = 0; index < hydrated_meals.length; index += 1)
    {
        const meal = hydrated_meals[index];
        const mealID = await createMeal(meal, insertedPlan.id);

        if (!mealID)
        {
            return null;
        }

        const mealItemsSaved = await insertMealItems(meal, mealID);

        if (!mealItemsSaved)
        {
            return null;
        }
    }

    return insertedPlan.id;
}