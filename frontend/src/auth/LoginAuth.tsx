import { supabase } from "@/lib/supabase";
import type { NavigateFunction } from "react-router-dom";
import { createUser } from "./UserService";
import type { LoginValues, SignupValues } from "./authSchemas.ts";

export async function onSignup(
    values: SignupValues,
    navigate: NavigateFunction
): Promise<string | null>
{
    const {
        email,
        password: pass,
        age,
        name,
        region,
        goals,
        height,
        sex,
        weight,
        activity: activity_level,
        health_conditions,
        dietary_restrictions,
        required_food_items,
    } = values

    const { data, error } = await supabase.auth.signUp({
    email: email,
    password: pass
    })
    if (error)
    {
    console.log("Error signing up user", error)
    return error.message
    }

    if (!data.user) {
        return "Account was created but no user was returned. Try logging in."
    }

    await createUser({
        id: data.user.id,
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
        active_meal_plan_id: null
    })
    navigate('/after-signup')
    return null
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
