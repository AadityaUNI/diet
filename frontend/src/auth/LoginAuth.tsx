import { supabase } from "@/lib/supabase";
import type React from "react";
import { createUser } from "./UserService";

export async function onSignup(e: React.FormEvent<HTMLFormElement>, navigate)
{
    e.preventDefault()

    const formdata = new FormData(e.currentTarget)

    const email = formdata.get("email") as string
    const pass = formdata.get("password") as string
    const age = Number(formdata.get("age"))
    const name = formdata.get("name") as string
    const region = formdata.get("region") as string
    const goals = formdata.get("goals") as string
    const height = Number(formdata.get("height")) 
    const sex = formdata.get("sex") as string 
    const weight = Number(formdata.get("weight"))
    const activity_level = formdata.get("activity") as string 

    let { data, error } = await supabase.auth.signUp({
    email: email,
    password: pass
    })
    if (error)
    {
        console.log("Error: signing up. ", error)
        return false
    }

    // create UserProfile
    createUser({id: data.user!.id, name: name, region: region, fitness_goals: goals, height:height, weight:weight, sex:sex, activity_level:activity_level, age: age, 
        health_conditions: [], dietary_restrictions: [], required_food_items: [], active_meal_plan_id: null
    })
    console.log({name: name, region: region, fitness_goals: goals, height:height, weight:weight, sex:sex, activity_level:activity_level})
    setTimeout(() => navigate('/'), 600)
}

export async function onLogin(e: React.FormEvent<HTMLFormElement>, navigate)
{
    e.preventDefault()

    const formdata = new FormData(e.currentTarget)

    const email = formdata.get("email") as string
    const pass = formdata.get("password") as string
    
    let { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: pass
    })
    if (error)
    {
        console.log(error)
        return false
    }
    console.log(data)
    navigate("/")
}
