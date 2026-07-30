import { supabase } from "@/lib/supabase";
import { type UpdateUserProfile, type UserProfile } from "@/types/types";

export async function createUser(profile: UserProfile)
{
  const { error } = await supabase
    .from('UserProfiles')
    .insert([profile])

    if (error)
    {
        return;
    }
}

export async function getActivePlanID(userID: string)
{
  const {data, error} = await supabase
  .from("UserProfiles")
  .select("active_meal_plan_id")
  .eq("id", userID)
  .single()

  if (error)
  {
    return 
  }
  return data.active_meal_plan_id
}


export async function currUserDetails(): Promise<UserProfile | undefined>
{
  const { data: users, error } = await supabase
    .from('UserProfiles')
    .select('*')
    .single()

    if (error)
    {
        return
    }

    if (users === null) {
      return
    }

    const profile = users as UserProfile
    const normalized: UserProfile = {
      ...profile,
      dietary_restrictions: profile.dietary_restrictions ?? [],
      health_conditions: profile.health_conditions ?? [],
      required_food_items: profile.required_food_items ?? [],
    }

    return normalized
}

export async function updateUserDetails(
  id: string,
  updates: UpdateUserProfile
) {
  const { error } = await supabase
    .from("UserProfiles")
    .update(updates)
    .eq("id", id)

  if (error)
  {
    return
  }
}

export async function logoutUser()
{
  const { error } = await supabase.auth.signOut()
  if (error)
  {
    return
  }
}