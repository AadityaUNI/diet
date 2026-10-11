import { supabase } from "@/lib/supabase";
import { SupabaseRequestError } from "@/lib/supabaseError";
import type { FullPlanData } from "@/types/types";
import type { GeneratedMeal, GeneratedPlan } from "@/types/generated-plan";
import { gramsForIngredient, type HydratedMeals, type PlanEditorDraft, type TotalMacros } from "@/types/plan-editor";

type HydratedMeal = HydratedMeals[number];

async function insertMealItems(meal: GeneratedMeal | HydratedMeal, mealID: number)
{
    if (meal.ingredients.length === 0) {
        return;
    }

    const mealItems = meal.ingredients.map((ingredient) => ({
        amount: gramsForIngredient(ingredient),
        foodID: ingredient.id,
        mealID
    }));

    const { error } = await supabase
        .from("MealItems")
        .insert(mealItems);

    if (error) {
        throw new SupabaseRequestError("Unable to save the meal's ingredients.", error);
    }
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
        throw new SupabaseRequestError("Unable to load your meal plans.", error);
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
        throw new SupabaseRequestError("Unable to delete this meal plan.", mealsError);
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
            throw new SupabaseRequestError("Unable to delete this meal plan.", mealItemsError);
        }

        const { error: mealsDeleteError } = await supabase
            .from("Meals")
            .delete()
            .eq("planID", planID);

        if (mealsDeleteError)
        {
            throw new SupabaseRequestError("Unable to delete this meal plan.", mealsDeleteError);
        }
    }

    const { error } = await supabase
        .from("MealPlans")
        .delete()
        .eq("id", planID)
        .eq("userID", userID);

    if (error)
    {
        throw new SupabaseRequestError("Unable to delete this meal plan.", error);
    }

    if (isActive)
    {
        const { error: updateError } = await supabase
            .from("UserProfiles")
            .update({ active_meal_plan_id: null })
            .eq("id", userID);

        if (updateError)
        {
            throw new SupabaseRequestError("The plan was deleted, but your active plan could not be cleared.", updateError);
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
        throw new SupabaseRequestError("Unable to save the meal plan.", planError);
    }

    return insertedPlan.id as number;
}

export async function createMeal(meal: GeneratedMeal | HydratedMeal, planID: number, tempMeal = false)
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
        temp_meal: tempMeal,
    };

    const { data: insertedMeal, error: mealError } = await supabase
        .from("Meals")
        .insert([mealInsert])
        .select("id")
        .single();

    if (mealError || !insertedMeal) {
        throw new SupabaseRequestError(`Unable to save the meal "${meal.name}".`, mealError);
    }

    return insertedMeal.id as number;
}

export async function createTemporaryMeal(meal: HydratedMeal, planID: number)
{
    if (meal.ingredients.length === 0 || meal.ingredients.some((ingredient) => !ingredient.id || Number(ingredient.amount) <= 0)) {
        throw new Error("Choose a food and enter a positive amount for every ingredient.");
    }

    const mealID = await createMeal({ ...meal }, planID, true);

    try {
        await insertMealItems(meal, mealID);
    } catch (error) {
        // best-effort cleanup so a half-saved meal doesn't linger
        await supabase.from("MealItems").delete().eq("mealID", mealID);
        await supabase.from("Meals").delete().eq("id", mealID).eq("planID", planID);
        throw error;
    }

    return mealID;
}

export async function deleteTemporaryMeal(mealID: number, planID: number)
{
    const { data: meal, error: mealLookupError } = await supabase
        .from("Meals")
        .select("id")
        .eq("id", mealID)
        .eq("planID", planID)
        .eq("temp_meal", true)
        .maybeSingle();

    if (mealLookupError) {
        throw new SupabaseRequestError("Unable to remove this meal.", mealLookupError);
    }

    if (!meal) {
        throw new Error("This meal no longer exists.");
    }

    const { error: mealItemsError } = await supabase
        .from("MealItems")
        .delete()
        .eq("mealID", mealID);

    if (mealItemsError) {
        throw new SupabaseRequestError("Unable to remove this meal.", mealItemsError);
    }

    const { error: mealError } = await supabase
        .from("Meals")
        .delete()
        .eq("id", mealID)
        .eq("planID", planID)
        .eq("temp_meal", true);

    if (mealError) {
        throw new SupabaseRequestError("Unable to remove this meal.", mealError);
    }
}

export async function createUserPlanFromAI(plan: GeneratedPlan, userID: string)
{
    const planID = await createMealPlan(plan, userID);

    for (const meal of plan.meals) {
        const mealID = await createMeal(meal, planID);
        await insertMealItems(meal, mealID);
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
        throw new SupabaseRequestError("Unable to change your active plan.", error);
    }
}

export async function editUserPlan(planID: number, draft: PlanEditorDraft, hydrated_meals: HydratedMeals, total_macros: TotalMacros): Promise<void>
{
    const { data: planRow, error: planRowError } = await supabase
        .from("MealPlans")
        .select("userID")
        .eq("id", planID)
        .single();

    if (planRowError || !planRow)
    {
        throw new SupabaseRequestError("Unable to save the edited meal plan.", planRowError);
    }

    const { error: updatePlanError } = await supabase
        .from("MealPlans")
        .update({ ...total_macros, name: draft.name })
        .eq("id", planID);

    if (updatePlanError)
    {
        throw new SupabaseRequestError("Unable to save the edited meal plan.", updatePlanError);
    }

    const { data: currentMeals, error: currentMealsError } = await supabase
        .from("Meals")
        .select("id")
        .eq("planID", planID)
        .eq("temp_meal", false);

    if (currentMealsError)
    {
        throw new SupabaseRequestError("Unable to save the edited meal plan.", currentMealsError);
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
            throw new SupabaseRequestError("Unable to save the edited meal plan.", deleteRemovedItemsError);
        }

        const { error: deleteRemovedMealsError } = await supabase
            .from("Meals")
            .delete()
            .in("id", removedMealIDs)
            .eq("planID", planID);

        if (deleteRemovedMealsError)
        {
            throw new SupabaseRequestError("Unable to save the edited meal plan.", deleteRemovedMealsError);
        }
    }

    const savedMealIDs: number[] = [];

    for (let index = 0; index < draft.meals.length; index += 1)
    {
        const meal = draft.meals[index];
        const hydratedMeal = hydrated_meals[index];

        if (!hydratedMeal)
        {
            throw new Error(`Meal "${meal.name}" is missing its ingredient data.`);
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
                throw new SupabaseRequestError("Unable to save the edited meal plan.", updateMealError);
            }

            savedMealIDs.push(meal.id);
            continue;
        }

        const mealID = await createMeal(hydratedMeal, planID);
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
            throw new SupabaseRequestError("Unable to save the edited meal plan.", deleteCurrentItemsError);
        }

        for (let index = 0; index < savedMealIDs.length; index += 1)
        {
            await insertMealItems(hydrated_meals[index], savedMealIDs[index]);
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
        throw new SupabaseRequestError("Unable to save the meal plan.", planError);
    }

    for (const meal of hydrated_meals)
    {
        const mealID = await createMeal(meal, insertedPlan.id);
        await insertMealItems(meal, mealID);
    }

    return insertedPlan.id as number;
}