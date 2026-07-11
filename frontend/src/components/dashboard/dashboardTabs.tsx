import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewTab } from "@/components/dashboard/overviewTabs";
import { SavedPlansTab } from "@/components/dashboard/saved/plansTab";
import { changeUserActivePlan, getAllFoodData } from "@/auth/PlanService";
import { toggleUserMealCompletion } from "@/auth/MealService";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router";
import { useDebouncedCallback } from "use-debounce";
import { getActivePlanID } from "@/auth/UserService";
import type { FullPlanData } from "@/types/types";

export interface DashboardTabsProps {}

export function DashboardTabs(_: DashboardTabsProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedPlan, setExpandedPlan] = useState<number | null>(null);
  const [activePlan, setActivePlan] = useState<FullPlanData | null>(null);
  const [savedPlans, setSavedPlans] = useState<FullPlanData[] | null>(null);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);

  const debouncedToggle = useDebouncedCallback((mealID: number, planID: number, state: boolean) => {
    toggleUserMealCompletion(mealID, planID, state);
  }, 350);

  const toggleMeal = (mealID: number, planID: number) => {
    const isCompleted = activePlan?.meal_plan_items.find((meal) => meal.meal_data.id === mealID)?.meal_completed ?? false;
    const state = !isCompleted;

    setActivePlan((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        meal_plan_items: prev.meal_plan_items.map((item) =>
          item.meal_data.id === mealID ? { ...item, meal_completed: state } : item,
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

      const allPlans = await getAllFoodData(user.id);
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

  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-5 w-full">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="saved">Saved</TabsTrigger>
      </TabsList>
      <OverviewTab
        activePlan={activePlan}
        toggleMeal={toggleMeal}
        getRecommended={getRecommended}
        loading={loadingPlans}
      />
      <SavedPlansTab
        savedPlans={savedPlans}
        expandedPlan={expandedPlan}
        setExpandedPlan={setExpandedPlan}
        loading={loadingPlans}
        getRecommended={getRecommended}
        onSetActive={onSetActive}
        activePlanID={activePlan?.id ?? null}
      />
    </Tabs>
  );
}