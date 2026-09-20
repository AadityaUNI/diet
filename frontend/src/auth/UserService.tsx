import { supabase } from "@/lib/supabase";
import { type UpdateUserProfile, type UserProfile } from "@/types/types";
import type { NormalizedUpdate, NormalizedUserProf } from "@/types/types";

function normalizeProf(profile: UserProfile | UpdateUserProfile) {
  const {age, weight, height, protein_target, carbs_target, fat_target, fibre_target} = profile;
  return {
  ...profile,
  ...(age && { age: Number(age) }),
  ...(weight && { weight: Number(weight) }),
  ...(height && { height: Number(height) }),
  ...(protein_target && { protein_target: Number(protein_target) }),
  ...(carbs_target && { carbs_target: Number(carbs_target) }),
  ...(fat_target && { fat_target: Number(fat_target) }),
  ...(fibre_target && { fibre_target: Number(fibre_target) }),
};

}

export async function createUser(profile: UserProfile)
{
  const numberedProfile = normalizeProf(profile) as NormalizedUserProf;
  const { error } = await supabase
    .from('UserProfiles')
    .insert([numberedProfile])

    if (error)
    {
      console.log("Error inserting user profile", error)
      throw new Error(error.message || "Unable to create your profile.");
    }

    return numberedProfile;
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
    console.log("Error fetching active plan ID", error)
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
      console.log("Error fetching current user details", error)
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
  const normUpdates = normalizeProf(updates) as NormalizedUpdate;
  const { error } = await supabase
    .from("UserProfiles")
    .update(normUpdates)
    .eq("id", id)

  if (error)
  {
     console.log("Error updating user details", error)
    return
  }
}

export async function logoutUser()
{
  const { error } = await supabase.auth.signOut()
  if (error)
  {
     console.log("Error signing out user", error)
    return
  }
}