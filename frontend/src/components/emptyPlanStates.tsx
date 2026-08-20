import { Sparkles, ClipboardList, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface NoActivePlanProps {
  onGetRecommended: () => void;
}

/**
 * Shown when the user has no active meal plan.
 * Offers two paths: get a new recommended plan, or
 * activate one they've already saved.
 */
export function NoActivePlanEmptyState({
  onGetRecommended,
}: NoActivePlanProps) {
  return (
    <Empty className="border border-dashed border-border bg-muted font-[Outfit]">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-muted text-foreground"
        >
          <ClipboardList />
        </EmptyMedia>
        <EmptyTitle>No active plan yet</EmptyTitle>
        <EmptyDescription>
          Get a plan tailored to your macros, or activate one you've already
          saved.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

interface NoSavedPlansProps {
  onGetRecommended: () => void;
}

/**
 * Shown when the user has no saved plans at all.
 * There's nothing to activate, so the only path forward
 * is generating a new recommended plan.
 */
export function NoSavedPlansEmptyState({
  onGetRecommended,
}: NoSavedPlansProps) {
  return (
    <Empty className="border border-dashed border-border bg-secondary font-[Outfit]">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-muted text-foreground"
        >
          <Bookmark />
        </EmptyMedia>
        <EmptyTitle>No saved plans yet</EmptyTitle>
        <EmptyDescription>
          Once you find a plan you like, save it here for quick access. Start
          by getting a recommended plan.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
