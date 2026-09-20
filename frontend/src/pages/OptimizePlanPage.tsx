import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { AppHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/auth/AuthContext";
import { getAnalyzed, type AnalyzeResponse } from "@/auth/RecommendGen";
import { editUserPlan } from "@/auth/PlanService";
import { OptimizeForm } from "@/components/optimize/OptimizeForm";
import { OptimizeLoading } from "@/components/optimize/OptimizeLoading";
import { OptimizeResults } from "@/components/optimize/OptimizeResults";
import type { FullPlanData, UserProfile } from "@/types/types";
import { calculateCalorieTarget } from "@/lib/calorieTarget";
import { hydrateDraft } from "@/lib/hydratePlanDraft";
import { planDraftFromSavedPlan } from "@/types/plan-editor";

type OptimizeLocationState = { plan?: FullPlanData; profile?: UserProfile };
type OptimizeView = "form" | "loading" | "results" | "error";

export default function OptimizePlanPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session_token } = useAuth();
  const routeState = location.state as OptimizeLocationState | null;
  const plan = routeState?.plan;
  const profile = routeState?.profile as UserProfile;
  const [view, setView] = useState<OptimizeView>("form");
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!result?.proposed_plan) {
        throw new Error("This review did not return a proposed plan to save.");
      }

      const draft = planDraftFromSavedPlan(result.proposed_plan);
      const { hydrated_meals, total_macros } = hydrateDraft(draft);
      const saved = await editUserPlan(draft.id, draft, hydrated_meals, total_macros);

      if (!saved) {
        throw new Error("Unable to save the analyzed changes.");
      }
    },
    onSuccess: () => navigate("/"),
  });

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (!plan || !profile || !session_token) {
        throw new Error("This plan is no longer available. Return to your dashboard and try again.");
      }
      setView("loading");
      return getAnalyzed(session_token, {
        plan,
        profile,
        calorie_target: calculateCalorieTarget(profile),
        ...(prompt.trim() ? { user_prompt: prompt.trim() } : {}),

      });
    },
    onSuccess: (data) => {
      setResult(data);
      setView("results");
    },
    onError: () => setView("error"),
  });

  if (!plan || !profile) {
    return <MissingPlanState onBack={() => navigate("/")} />;
  }

  if (view === "loading") {
    return <OptimizeLoading />;
  }

  if (view === "results" && result) {
    return <OptimizeResults plan={plan} result={result} saving={saveMutation.isPending} saveError={saveMutation.error instanceof Error ? saveMutation.error.message : null} onAccept={() => saveMutation.mutate()} onKeepCurrent={() => navigate(-1)} onBack={() => setView("form")} />;
  }

  if (view === "error") {
    return (
      <div className="min-h-screen bg-transparent">
        <AppHeader loading={false} />
        <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-5 text-center">
          <AlertCircle className="text-destructive" size={28} />
          <h1 className="mt-4 font-outfit text-xl font-bold">We couldn’t review this plan</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{analyzeMutation.error instanceof Error ? analyzeMutation.error.message : "Please try again in a moment."}</p>
          <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row"><Button onClick={() => { setView("form"); analyzeMutation.reset(); }} className="min-h-12 flex-1 text-base">Try again</Button><Button variant="outline" onClick={() => navigate(-1)} className="min-h-12 flex-1 text-base">Go back</Button></div>
        </main>
      </div>
    );
  }

  const targets = {
    calories: calculateCalorieTarget(profile),
    protein: Number(profile.protein_target),
    carbs: Number(profile.carbs_target),
    fat: Number(profile.fat_target),
    fibre: Number(profile.fibre_target),
  };

  return <OptimizeForm plan={plan} targets={targets} prompt={prompt} onPromptChange={setPrompt} onSubmit={() => analyzeMutation.mutate()} />;
}

function MissingPlanState({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-transparent">
      <AppHeader loading={false} />
      <main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-5">
        <Card className="w-full border-border bg-card/80"><CardContent className="p-6 text-center"><AlertCircle className="mx-auto text-muted-foreground" size={28} /><h1 className="mt-4 font-outfit text-xl font-bold">Choose a plan to change</h1><p className="mt-2 text-sm leading-relaxed text-muted-foreground">This review was opened without a plan. Return to your dashboard and choose one of your saved plans.</p><Button onClick={onBack} className="mt-6 w-full gap-2"><ArrowLeft size={16} />Return to dashboard</Button></CardContent></Card>
      </main>
    </div>
  );
}
