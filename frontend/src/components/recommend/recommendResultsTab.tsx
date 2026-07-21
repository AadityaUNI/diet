import { AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { RecommendedPlanCard } from "@/components/recommend/recommendedPlanCard";
import type { RecommendResponse, GeneratedPlan } from "@/types/generated-plan";
import { AppHeader } from "../header";

interface RecommendResultsTabProps {
  results: RecommendResponse;
  expandedPlanIndex: number | null;
  setExpandedPlanIndex: (index: number | null) => void;
  savedPlanIndices: Set<number>;
  savedLoading: boolean; 
  onSavePlan: (plan: GeneratedPlan, index: number) => void;
}

export function RecommendResultsTab({
  results,
  expandedPlanIndex,
  setExpandedPlanIndex,
  savedPlanIndices,
  savedLoading,
  onSavePlan,
}: RecommendResultsTabProps) {
  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <AppHeader loading={savedLoading} />

      <main className="mx-auto max-w-lg lg:max-w-4xl lg:w-4xl px-4 pb-28">
        <div className="flex flex-col gap-4">
          {(results.skipped_items && results.skipped_items.length > 0) && (
            <Card
              className="border-amber-500/20"
              style={{ backgroundColor: "rgba(245, 158, 11, 0.06)" }}
            >
              <CardContent className="flex items-start gap-2.5 p-3.5">
                <AlertCircle
                  size={14}
                  className="mt-0.5 shrink-0 text-amber-400"
                />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-amber-400">
                    {results.skipped_items.length} item
                    {results.skipped_items.length > 1 ? "s" : ""} skipped:{" "}
                  </span>
                  {results.skipped_items.join(", ")}
                </p>
              </CardContent>
            </Card>
          )}

          {results.plans && results.plans.map((plan, index) => (
            <RecommendedPlanCard
              key={`${plan.name}-${index}`}
              plan={plan}
              isOpen={expandedPlanIndex === index}
              savedLoading={savedLoading}
              onToggleOpen={() =>
                setExpandedPlanIndex(expandedPlanIndex === index ? null : index)
              }
              isSaved={savedPlanIndices.has(index)}
              onSave={(plan) => onSavePlan(plan, index)}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
