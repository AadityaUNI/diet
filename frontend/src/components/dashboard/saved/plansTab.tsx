// components/dashboard/saved/saved-plans-tab.tsx
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PlanCard, type SavedPlan } from "@/components/dashboard/saved/plan-card";

interface SavedPlansTabProps {
  savedPlans: SavedPlan[];
  expandedPlan: string | null;
  setExpandedPlan: (id: string | null) => void;
  bookmarked: Set<string>;
  setBookmarked: React.Dispatch<React.SetStateAction<Set<string>>>;
  goalStyle: Record<string, { color: string; label: string }>;
}

export function SavedPlansTab({ savedPlans, expandedPlan, setExpandedPlan, bookmarked, setBookmarked, goalStyle }: SavedPlansTabProps) {
  const toggleBookmark = (id: string) => {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <TabsContent value="saved" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-outfit text-base font-bold">Saved Plans</h2>
          <p className="text-xs text-muted-foreground">AI-generated · tap to expand</p>
        </div>
        <Badge className="font-mono text-xs">{savedPlans.length} plans</Badge>
      </div>

      {savedPlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isOpen={expandedPlan === plan.id}
          isBookmarked={bookmarked.has(plan.id)}
          goalStyle={goalStyle[plan.goal]}
          onToggleOpen={(id) => setExpandedPlan(expandedPlan === id ? null : id)}
          onToggleBookmark={toggleBookmark}
        />
      ))}

    </TabsContent>
  );
}