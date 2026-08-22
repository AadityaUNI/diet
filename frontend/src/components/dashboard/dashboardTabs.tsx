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


export function DashboardTabs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState<FullPlanData | null>(null);
  const [savedPlans, setSavedPlans] = useState<FullPlanData[] | null>(null);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

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
      if (!user?.id) {
        setActivePlan(null);
        setSavedPlans(null);
        setLoadingPlans(false);
        return;
      }

      const userProfile = await currUserDetails();
      setProfile(userProfile ?? null);

      const allPlans: FullPlanData[] | null = await getAllFoodData(user.id);
      const activePlanID = await getActivePlanID(user.id);
      const active = allPlans?.find((plan) => plan.id === activePlanID) ?? null;

      setActivePlan(active as FullPlanData | null);
      setSavedPlans(allPlans as FullPlanData[] | null);
      setLoadingPlans(false);
    }

    getPlans();
  }, [user?.id]);

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

  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-5 w-full bg-muted dark:bg-white/10">
        <TabsTrigger
          value="overview"
          className="data-active:bg-primary data-active:text-white dark:data-active:bg-white dark:data-active:text-black dark:data-active:border-transparent"
        >
          Active
        </TabsTrigger>
        <TabsTrigger
          value="saved"
          className="data-active:bg-primary data-active:text-white dark:data-active:bg-white dark:data-active:text-black dark:data-active:border-transparent"
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
        calorieTarget={profile ? calculateCalorieTarget(profile) : null}
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
      />
    </Tabs>
  );
}