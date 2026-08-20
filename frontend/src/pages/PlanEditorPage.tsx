import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppHeader } from "@/components/header";
import { PlanEditor } from "@/components/plan/PlanEditor";
import type { FullPlanData } from "@/types/types";
import {
  createBlankIngredientDraft,
  createBlankMealDraft,
  createEmptyPlanDraft,
  planDraftFromSavedPlan,
  type PlanEditorDraft,
} from "@/types/plan-editor";
import { useAuth } from "@/auth/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { createCustomUserPlan, editUserPlan } from "@/auth/PlanService";
import { hydrateDraft } from "@/lib/hydratePlanDraft";

type PlanEditorLocationState = {
  plan?: FullPlanData;
};

export default function PlanEditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const { user } = useAuth();
  const routeState = location.state as PlanEditorLocationState | null;
  const isEditMode = params.planId !== undefined;

  const [draft, setDraft] = useState<PlanEditorDraft>(() => createEmptyPlanDraft());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!routeState?.plan) {
      return;
    }

    setDraft(
        planDraftFromSavedPlan(routeState.plan)
    );
  }, [routeState?.plan]);

  const handleAddMeal = () => {
    setDraft((current) => ({
      ...current,
      meals: [...current.meals, createBlankMealDraft()],
    }));
  };

  const handleRemoveMeal = (mealId: number) => {
    setDraft((current) => ({
      ...current,
      meals: current.meals.length > 1
        ? current.meals.filter((meal) => meal.id !== mealId)
        : current.meals,
    }));
  };

  const handleAddIngredient = (mealId: number) => {
    setDraft((current) => ({
      ...current,
      meals: current.meals.map((meal) =>
        meal.id === mealId
          ? { ...meal, ingredients: [...meal.ingredients, createBlankIngredientDraft()] }
          : meal,
      ),
    }));
  };

  const handleRemoveIngredient = (mealId: number, ingredientId: number) => {
    setDraft((current) => ({
      ...current,
      meals: current.meals.map((meal) =>
        meal.id === mealId && meal.ingredients.length > 1
          ? { ...meal, ingredients: meal.ingredients.filter((ingredient) => ingredient.id !== ingredientId) }
          : meal,
      ),
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      setSaving(true);
      const {hydrated_meals, total_macros} = hydrateDraft(draft);
      if (isEditMode)
      {
        editUserPlan(draft.id, draft, hydrated_meals, total_macros)
      }
      else createCustomUserPlan(draft, user!.id, hydrated_meals, total_macros)
    },
    onSettled: () => setSaving(false)
  })

  return (
    <>
      <AppHeader loading={false} />
      <PlanEditor
        mode={isEditMode ? "edit" : "create"}
        draft={draft}
        onChange={setDraft}
        onAddMeal={handleAddMeal}
        onRemoveMeal={handleRemoveMeal}
        onAddIngredient={handleAddIngredient}
        onRemoveIngredient={handleRemoveIngredient}
        onSave={() => saveMutation.mutate()}
        onCancel={() => navigate(-1)}
        saving={saving}
      />
    </>
  );
}