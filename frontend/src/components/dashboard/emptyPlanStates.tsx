import { ClipboardList, Bookmark } from "lucide-react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * Shown when the user has no active meal plan.
 */
export function NoActivePlanEmptyState() {
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

/**
 * Shown when the user has no saved plans at all.
 */
export function NoSavedPlansEmptyState() {
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
