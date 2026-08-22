import { useEffect, useState } from "react";

import { RecommendForm } from "@/components/recommend/RecommendForm";
import { RecommendLoading } from "@/components/recommend/RecommendLoading";
import { RecommendResultsTab } from "@/components/recommend/recommendResultsTab";
import type { GeneratedPlan, RecommendResponse } from "@/types/generated-plan";
import type { UserProfile } from "@/types/types";
import { currUserDetails } from "@/auth/UserService";
import HomeButton from "@/components/homeButton";

import { useMutation, useQuery } from "@tanstack/react-query";
import { getAIRec } from "@/auth/RecommendGen";
import { RecommendError } from "@/components/recommend/recommendError";
import type { View, Goal } from "@/types/generated-plan";
import { useAuth } from "@/auth/AuthContext";
import { createUserPlanFromAI } from "@/auth/PlanService";
import { calculateCalorieTarget } from "@/lib/calorieTarget";

type RecommendVariables = {
  profile: UserProfile;
  goal: Goal;
  restrictions: string[];
  conditions: string[];
  mustHave: string[];
  goal_calories: number;
};

export function RecommendPage() {

  // All hooks first — no early returns before this point
  const {session_token} = useAuth()
  const [view, setView] = useState<View>("form");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goal, setGoal] = useState<Goal>("cut");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);
  const [mustHave, setMustHave] = useState<string[]>([]);
  const [goal_calories, setGoalCalories] = useState<number | null>(null);
  const [results,             setResults]            = useState<RecommendResponse | null>(null);
  const [savedPlanIndices,    setSavedPlanIndices]   = useState<Set<number>>(new Set());
  const [expandedPlanIndex,   setExpandedPlanIndex]  = useState<number | null>(null);
  const [savedLoading, setSavedLoading] = useState<boolean>(false)

  const profileQuery = useQuery({
    queryKey: ["userProfile", session_token],
    enabled: Boolean(session_token),
    queryFn: async () => {
      const loadedProfile = await currUserDetails()

      if (!loadedProfile) {
        throw new Error("Unable to load user profile.")
      }

      return loadedProfile
    },
  })

  useEffect(() => {
    const loadedProfile = profileQuery.data
    if (!loadedProfile) {
      return
    }

    setProfile(loadedProfile)
    setGoal(loadedProfile.fitness_goals as Goal)
    setRestrictions(loadedProfile.dietary_restrictions ?? [])
    setConditions(loadedProfile.health_conditions ?? [])
    setMustHave(loadedProfile.required_food_items ?? [])
    setGoalCalories(calculateCalorieTarget(loadedProfile))
  }, [profileQuery.data])

const recMutation = useMutation({
  mutationFn: async ({
    profile,
    goal,
    restrictions,
    conditions,
    mustHave,
    goal_calories,
    }: RecommendVariables) => {
    const newProfile = {...profile, health_conditions: conditions, dietary_restrictions: restrictions, fitness_goals: goal, required_food_items: mustHave}
    setView("loading")
    return getAIRec(session_token!, {...newProfile, goal_calories});
    },

    onSuccess: (data) => {
      if (!data || data == -1) {
        setView("error")
        return
      }
      setView("results")
      setResults(data)
    },
    onError: () => setView("error")
  })

  const saveMutation = useMutation({
    mutationFn: async ({plan, index} : {plan: GeneratedPlan, index: number}) => {
      return handleSavePlan(plan, index)
    },
    onSuccess: () => setSavedLoading(false),
    onError: () => setSavedLoading(false)
  })

  const handleSavePlan = async (plan: GeneratedPlan, index: number) => {
    if (!profile) {
      return;
    }
    setSavedPlanIndices((prev) => new Set([...prev, index]));
    setSavedLoading(true)
    const savedPlanID = await createUserPlanFromAI(plan, profile.id);

    if (!savedPlanID) {
      return;
    }

  };

  if (view === "form") {
    return (
      <>
      <RecommendForm
        goal={goal} setGoal={setGoal}
        restrictions={restrictions} setRestrictions={setRestrictions}
        conditions={conditions} setConditions={setConditions}
        mustHave={mustHave} setMustHave={setMustHave}
        imported={Boolean(profile)}
        loadingUser={profileQuery.isLoading}
        onGenerate={() => {
          if (profile && goal_calories !== null) {
            recMutation.mutate({profile, conditions, mustHave, restrictions, goal, goal_calories })
          }
        }}
      />
      <HomeButton loading={false} />
      </>
    );
  }

  if (view === "loading") {
    return (
      <RecommendLoading />
    )
  }

  if (view === "error") {
    return (
      <RecommendError
        message={
          recMutation.error instanceof Error
            ? recMutation.error.message
            : undefined
        }
      />
    );
  }

  return (
    <>
    <RecommendResultsTab
      results={results!}
      expandedPlanIndex={expandedPlanIndex}
      setExpandedPlanIndex={setExpandedPlanIndex}
      savedPlanIndices={savedPlanIndices}
      onSavePlan={(plan, idx) => saveMutation.mutate({plan: plan, index: idx})}
      savedLoading={savedLoading}
    />
    <HomeButton loading={savedLoading} />
    </>
  );
}
