import { useEffect, useState } from "react";

import { RecommendForm } from "@/components/recommend/RecommendForm";
import { RecommendLoading } from "@/components/recommend/RecommendLoading";
import { RecommendResultsTab } from "@/components/recommend/recommendResultsTab";
import type { GeneratedPlan, RecommendResponse } from "@/types/generated-plan";
import type { UserProfile } from "@/types/types";
import { currUserDetails } from "@/auth/UserService";
import HomeButton from "@/components/homeButton";

import { useMutation } from "@tanstack/react-query";
import { getAIRec } from "@/auth/RecommendGen";
import { RecommendError } from "@/components/recommend/recommendError";
import type { View, Goal } from "@/types/generated-plan";
import { createUserPlan } from "@/auth/PlanService";
import { useAuth } from "@/auth/AuthContext";

type RecommendVariables = {
  profile: UserProfile;
  goal: Goal;
  restrictions: string[];
  conditions: string[];
  mustHave: string[];
};

// TODO(dev-only): stand-in for the real POST /recommend response until the
// endpoint is wired up (main.py's recommend() doesn't currently `return`
// anything, so there's nothing to fetch yet). Shape matches call_gemini's
// prompt schema exactly — swap this for a real fetch once the backend
// returns the response and you know how auth/profile data reach the request.

export function RecommendPage() {

  // All hooks first — no early returns before this point
  const {session_token} = useAuth()
  const [profile, setProfile] = useState<UserProfile | null> (null)

  useEffect(() => {
    async function getProfile()
    {
      setProfile(await currUserDetails() as UserProfile)
      console.log("Set the user", profile)
    }
    getProfile()
  }, [])

  const [view,               setView]               = useState<View>("form");
  const [goal,                setGoal]               = useState<Goal>("cut");
  const [restrictions,        setRestrictions]       = useState<string[]>([]);
  const [conditions,          setConditions]         = useState<string[]>([]);
  const [mustHave,             setMustHave]           = useState<string[]>([]);
  const [imported,            setImported]           = useState(false);
  const [results,             setResults]            = useState<RecommendResponse | null>(null);
  const [savedPlanIndices,    setSavedPlanIndices]   = useState<Set<number>>(new Set());
  const [expandedPlanIndex,   setExpandedPlanIndex]  = useState<number | null>(null);
  const [savedLoading, setSavedLoading] = useState<boolean>(false)

  // ── Handlers ──
  const handleImport = () => {
    if (!profile) return
    setGoal(profile.fitness_goals as Goal);
    setRestrictions(profile.dietary_restrictions as string[]);
    setConditions(profile.health_conditions as string[]);
    setMustHave(profile.required_food_items as string[]);
    setImported(true);
  };


const recMutation = useMutation({
  mutationFn: async ({
    profile,
    goal,
    restrictions,
    conditions,
    mustHave,
    }: RecommendVariables) => {
    const newProfile = {...profile, health_conditions: conditions, dietary_restrictions: restrictions, fitness_goals: goal, required_food_items: mustHave}
    setView("loading")
    return getAIRec(session_token!, newProfile);
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
    onSuccess: () => setSavedLoading(false)
  })

  const handleSavePlan = async (plan: GeneratedPlan, index: number) => {
    if (!profile) {
      return;
    }
    setSavedPlanIndices((prev) => new Set([...prev, index]));
    setSavedLoading(true)
    const savedPlanID = await createUserPlan(plan, profile.id);

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
        imported={imported} onImport={handleImport}
        loadingUser={profile ? false : true}
        onGenerate={() => recMutation.mutate({profile: profile as UserProfile, conditions, mustHave, restrictions, goal })}
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
