import { supabase } from "@/lib/supabase";
import { type UserProfile } from "@/lib/types";
export async function createUser(name: string, region: string, goals: string)
{
    const { data, error } = await supabase
    .from('Users')
    .insert([
        { name: name, region: region, fitness_goals: goals},
    ])

    if (error)
    {
        console.log("Error: creating user", error);
    }
}


export async function currUserDetails()
{
    let { data: users, error } = await supabase
    .from('Users')
    .select('*')
    .single()

    if (error)
    {
        console.log("Error: getting user details", error)
        return
    }

    return users
}

export async function updateUserDetails(
  updates: UserProfile
) {
  const { data, error } = await supabase
    .from("UserProfiles")
    .update(updates)
    .select();

  if (error)
  {
    console.log("Error: updating user profile", error)
  }
}