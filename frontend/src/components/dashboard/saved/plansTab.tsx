import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlanCard } from "@/components/dashboard/saved/planCard";
import { MealSkeleton } from "@/components/MealSkeleton";
import { NoSavedPlansEmptyState } from "@/components/emptyPlanStates";
import type { FullPlanData } from "@/types/types";


export interface SavedPlansTabProps {
  savedPlans: FullPlanData[] | null;
  expandedPlan: number | null;
  setExpandedPlan: (id: number | null) => void;
  loading: boolean;
  getRecommended: () => void;
  onSetActive: (id: number | null) => void;
  activePlanID: number | null;
  onDeletePlan: (planID: number) => void; 
  onEditPlan: (plan: FullPlanData) => void;
}

export function SavedPlansTab({ activePlanID, savedPlans, expandedPlan, setExpandedPlan, loading, getRecommended ,onSetActive, onDeletePlan, onEditPlan }: SavedPlansTabProps) {
  
  
  if (loading) {
    return (
      <TabsContent value="saved" className="flex flex-col gap-4">
        <MealSkeleton />
      </TabsContent>
    );
  }

  if (!savedPlans || savedPlans.length === 0) {
    return (
      <TabsContent value="saved" className="flex flex-col gap-4">
        <NoSavedPlansEmptyState onGetRecommended={getRecommended} />
      </TabsContent>
    );
  }

  
  return (
    <TabsContent value="saved" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-outfit text-base font-bold">Saved Plans</h2>
          <p className="text-xs text-muted-foreground">Tap to expand</p>
        </div>
        <Badge variant="secondary" className="font-mono text-xs">{savedPlans.length} plans</Badge>
      </div>

      {savedPlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isOpen={expandedPlan === plan.id}
          onToggleOpen={(id) => setExpandedPlan(expandedPlan === id ? null : id)}
          isActive={plan.id === activePlanID}
          onSetActive={onSetActive}
          onDeletePlan={onDeletePlan}
          onEditPlan={onEditPlan}
        />
      ))}
    </TabsContent>
  );
}