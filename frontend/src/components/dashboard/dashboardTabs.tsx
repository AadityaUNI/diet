import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/dashboard/overviewTabs";
import { SavedPlansTab } from "@/components/dashboard/saved/plansTab";
import { changeUserActivePlan, deleteUserPlan, getAllFoodData } from "@/auth/PlanService";
import { toggleUserMealCompletion } from "@/auth/MealService";
import { useAuth } from "@/auth/AuthContext";
import { useDebouncedCallback } from "use-debounce";
import { currUserDetails, getActivePlanID } from "@/auth/UserService";
import { calculateCalorieTarget } from "@/lib/calorieTarget";
import type { UserProfile } from "@/types/types";
import type { FullPlanData } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";


export function DashboardTabs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState<FullPlanData | null>(null);
  const [savedPlans, setSavedPlans] = useState<FullPlanData[] | null>(null);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const handleDeletePlan = useMutation({
    mutationFn: async (planID: number) => {
      setSavedPlans(prev => prev!.filter((plan) => plan.id !== planID))
      const deletedActive = activePlan ? planID === activePlan.id : false
      if (deletedActive) setActivePlan(null)
      return deleteUserPlan(planID, deletedActive, user!.id)
    }
  })

  const debouncedToggle = useDebouncedCallback((mealID: number, planID: number, state: boolean) => {
    toggleUserMealCompletion(mealID, planID, state);
  }, 350);

  const toggleMeal = (mealID: number) => {
    const meal = activePlan?.meals.find((item) => item.id === mealID);
    const isCompleted = meal?.meal_completed ?? false;
    const state = !isCompleted;
    const planID = meal?.planID ?? activePlan?.id;

    if (!planID) {
      return;
    }

    setActivePlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        meals: prev.meals.map((item) =>
          item.id === mealID ? { ...item, meal_completed: state } : item,
        ),
      };
    });

    debouncedToggle(mealID, planID, state);
  };

  useEffect(() => {
    async function getPlans() {
      setLoadError(null);
      setLoadingPlans(true);
      if (!user?.id) {
        setActivePlan(null);
        setSavedPlans(null);
        setLoadingPlans(false);
        return;
      }

      try {
        const userProfile = await currUserDetails();
        const allPlans: FullPlanData[] | null = await getAllFoodData(user.id);
        const activePlanID = await getActivePlanID(user.id);
        const active = allPlans?.find((plan) => plan.id === activePlanID) ?? null;

        setProfile(userProfile ?? null);
        setActivePlan(active as FullPlanData | null);
        setSavedPlans(allPlans as FullPlanData[] | null);
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Unable to load your dashboard.");
      } finally {
        setLoadingPlans(false);
      }
    }

    getPlans();
  }, [user?.id, reloadToken]);

  const debouncedSetActive = useDebouncedCallback((userID: string, planID: number | null) => {
    changeUserActivePlan(userID, planID);
  }, 500);

  const onSetActive = (planID: number | null) => {
    if (!planID) {
      setActivePlan(null);
    } else {
      setActivePlan(savedPlans?.find((plan) => plan.id === planID) ?? null);
    }

    if (user?.id) {
      debouncedSetActive(user.id, planID);
    }
  };

  const getRecommended = () => {
    navigate("/recommend");
  };

  const editPlan = (plan: FullPlanData) => {
    navigate(`/plans/${plan.id}/edit`, { state: { plan } });
  };

  const optimizePlan = (plan: FullPlanData) => {
    if (!profile) {
      return;
    }
    navigate("/optimize", { state: { plan, profile } });
  };

  if (loadError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/25 bg-destructive/5 px-5 py-8 text-center">
        <AlertCircle className="text-destructive" size={24} />
        <p className="text-sm text-destructive">{loadError}</p>
        <Button className="min-h-12 gap-2 px-6" onClick={() => setReloadToken((current) => current + 1)}>
          <RotateCcw size={16} /> Try again
        </Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-5 h-12 w-full bg-muted dark:bg-white/10">
        <TabsTrigger
          value="overview"
          className="min-h-11 px-4 py-2 text-base data-active:bg-primary data-active:text-white dark:data-active:bg-white dark:data-active:text-black dark:data-active:border-transparent"
        >
          Active
        </TabsTrigger>
        <TabsTrigger
          value="saved"
          className="min-h-11 px-4 py-2 text-base data-active:bg-primary data-active:text-white dark:data-active:bg-white dark:data-active:text-black dark:data-active:border-transparent"
        >
          Saved
        </TabsTrigger>
      </TabsList>
      <OverviewTab
        activePlan={activePlan}
        toggleMeal={toggleMeal}
        getRecommended={getRecommended}
        loading={loadingPlans}
        onEditPlan={editPlan}
        onOptimizePlan={optimizePlan}
        calorieTarget={profile ? calculateCalorieTarget(profile) : null}
        macroGoals={profile ? {
          protein_target: Number(profile.protein_target),
          carbs_target: Number(profile.carbs_target),
          fat_target: Number(profile.fat_target),
          fiber_target: Number(profile.fibre_target),
        } : undefined}
      />
      <SavedPlansTab
        savedPlans={savedPlans}
        expandedPlan={expandedPlan}
        setExpandedPlan={setExpandedPlan}
        loading={loadingPlans}
        getRecommended={getRecommended}
        onSetActive={onSetActive}
        activePlanID={activePlan?.id ?? null}
        onDeletePlan={(planID) => handleDeletePlan.mutate(planID)}
        onEditPlan={editPlan}
        onOptimizePlan={optimizePlan}
      />
    </Tabs>
  );
}