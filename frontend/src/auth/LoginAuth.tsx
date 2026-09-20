import { supabase } from "@/lib/supabase";
import type { NavigateFunction } from "react-router-dom";
import { createUser } from "./UserService";
import type { CredentialsValues, LoginValues, SignupValues } from "./authSchemas.ts";

export type CreatedAccount = {
    userId: string;
};

export async function createAuthAccount(values: CredentialsValues): Promise<CreatedAccount> {
        const { data, error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
        });

        if (error) {
            throw new Error(error.message);
        }

        if (!data.user) {
            throw new Error("Account was created but no user was returned. Try logging in.");
        }

        return { userId: data.user.id };
}

export async function createSignupProfile(userId: string, values: SignupValues) {
        const {
                age, name, region, goals, height, sex, weight, activity: activity_level,
                health_conditions, dietary_restrictions, required_food_items,
                protein_target, carbs_target, fat_target, fiber_target,
        } = values;

        return createUser({
                id: userId,
        name: name,
        region: region,
        fitness_goals: goals,
        height: height,
        weight: weight,
        sex: sex,
        activity_level: activity_level,
        age: age,
        health_conditions: health_conditions ?? [],
        dietary_restrictions: dietary_restrictions ?? [],
        required_food_items: required_food_items ?? [],
        active_meal_plan_id: null,
        protein_target: protein_target,
        fat_target: fat_target,
        fibre_target: fiber_target, 
        carbs_target: carbs_target
    })
}

export async function onSignup(
    values: SignupValues,
    navigate: NavigateFunction
): Promise<string | null> {
    try {
        const account = await createAuthAccount(values);
        await createSignupProfile(account.userId, values);
        navigate('/after-signup');
        return null;
    } catch (error) {
        return error instanceof Error ? error.message : "Unable to complete signup.";
    }
}

export async function onLogin(
    values: LoginValues,
    navigate: NavigateFunction
)
{
    const { email, password: pass } = values
    
    const { error } = await supabase.auth.signInWithPassword({
    email: email,
    password: pass
    })
    if (error)
    {
        console.log("Error signing in user", error)
        return false
    }
    navigate("/")
}
