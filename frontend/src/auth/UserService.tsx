import { supabase } from "@/lib/supabase";
import { SupabaseRequestError } from "@/lib/supabaseError";
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
      throw new SupabaseRequestError(error.message || "Unable to create your profile.", error);
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
    throw new SupabaseRequestError("Unable to load your active plan.", error)
  }
  return data.active_meal_plan_id
}


export async function currUserDetails(): Promise<UserProfile>
{
  const { data: users, error } = await supabase
    .from('UserProfiles')
    .select('*')
    .single()

    if (error)
    {
      throw new SupabaseRequestError("Unable to load your profile.", error)
    }

    if (users === null) {
      throw new Error("Your profile could not be found.")
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
    throw new SupabaseRequestError("Unable to save your profile.", error)
  }
}

export async function logoutUser()
{
  const { error } = await supabase.auth.signOut()
  if (error)
  {
    throw new SupabaseRequestError("Unable to sign out. Please try again.", error)
  }
}