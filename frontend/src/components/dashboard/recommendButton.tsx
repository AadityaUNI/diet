import { Button } from "@/components/ui/button";
import { PencilLine, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function RecommendButton() {
  const navigate = useNavigate();

  const recommendClick = () => {
    navigate("/recommend");
  };

  const createPlanClick = () => {
    navigate("/plans/new");
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+1rem)] z-50 flex justify-center px-4">
      {/* Frosted dock, same treatment as the sticky header */}
      <div className="pointer-events-auto grid w-full max-w-md grid-cols-2 gap-1.5 rounded-full border border-border bg-background/80 p-1.5 shadow-lg shadow-black/5 backdrop-blur-md dark:shadow-black/40">
        <Button
          onClick={recommendClick}
          title="Generate a meal plan with AI"
          className="h-11 min-w-0 gap-1.5 rounded-full px-2 text-sm font-semibold sm:gap-2 sm:px-3"
        >
          <Sparkles className="size-4 shrink-0 fill-primary-foreground/30" />
          <span className="truncate">AI plan</span>
        </Button>
        <Button
          onClick={createPlanClick}
          variant="ghost"
          title="Build a meal plan yourself"
          className="h-11 min-w-0 gap-1.5 rounded-full px-2 text-sm font-semibold sm:gap-2 sm:px-3"
        >
          <PencilLine className="size-4 shrink-0" />
          <span className="truncate">Custom plan</span>
        </Button>
      </div>
    </div>
  );
}
