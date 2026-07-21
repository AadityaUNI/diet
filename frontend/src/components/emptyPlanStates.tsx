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

/**
 * DietGrid color tokens used here:
 * primary:    #4F7EFF
 * accent:     #00D47E
 * background: #1A2844
 * font:       Outfit
 */

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
    <Empty className="border border-dashed border-[#4F7EFF]/25 bg-[#4F7EFF]/[0.03] font-[Outfit]">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-[#4F7EFF]/10 text-[#4F7EFF]"
        >
          <ClipboardList />
        </EmptyMedia>
        <EmptyTitle className="text-white">No active plan yet</EmptyTitle>
        <EmptyDescription className="text-white">
          Get a plan tailored to your macros, or activate one you've already
          saved.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={onGetRecommended}
            className="bg-[#4F7EFF] text-white hover:bg-[#4F7EFF]/90"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Get Recommended Plans
          </Button>
          
        </div>
      </EmptyContent>
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
    <Empty className="border border-dashed border-[#00D47E]/25 bg-[#00D47E]/[0.03] font-[Outfit]">
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="bg-[#00D47E]/10 text-[#00D47E]"
        >
          <Bookmark />
        </EmptyMedia>
        <EmptyTitle className="text-white">No saved plans yet</EmptyTitle>
        <EmptyDescription className="text-white">
          Once you find a plan you like, save it here for quick access. Start
          by getting a recommended plan.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={onGetRecommended}
          className="bg-[#4F7EFF] text-white hover:bg-[#4F7EFF]/90"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Get Recommended Plans
        </Button>
      </EmptyContent>
    </Empty>
  );
}
