import { supabase } from "@/lib/supabase";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "./UserService";

export async function onSignup(e: React.FormEvent<HTMLFormElement>, navigate)
{
    e.preventDefault()

    const formdata = new FormData(e.currentTarget)

    const email = formdata.get("email") as string
    const pass = formdata.get("password") as string
    const name = formdata.get("name") as string
    const region = formdata.get("region") as string
    const goals = formdata.get("goals") as string

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
    createUser(name, region, goals)
    navigate("/")
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
