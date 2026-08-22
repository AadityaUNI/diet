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
    <div className="pointer-events-none fixed bottom-7 left-0 right-0 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-end gap-3 sm:w-full sm:max-w-lg">
        <div className="flex flex-col items-center gap-1 sm:flex-1 sm:flex-row sm:gap-2">
          <Button
            onClick={recommendClick}
            aria-label="Recommend diet with AI"
            title="Recommend diet with AI"
            className="size-13 rounded-full p-0 font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 sm:h-15 sm:w-15 sm:flex-1 sm:gap-2.5 sm:rounded-full sm:px-6 sm:py-6"
          >
            <Sparkles className="h-4 w-4 fill-primary-foreground/30 text-primary-foreground" />
            <span className="hidden sm:inline">Recommend Diet with AI</span>
          </Button>
          <span className="text-[10px] font-medium leading-none text-muted-foreground sm:hidden">AI plan</span>
        </div>

        <div className="flex flex-col items-center gap-1 sm:flex-1 sm:flex-row sm:gap-2">
          <Button
            onClick={createPlanClick}
            variant="secondary"
            aria-label="Create your own plan"
            title="Create your own plan"
            className="size-13 rounded-full p-0 font-semibold sm:h-15 sm:w-15 sm:flex-1 sm:gap-2.5 sm:rounded-full sm:px-6 sm:py-6"
          >
            <PencilLine className="h-4 w-4" />
            <span className="hidden sm:inline">Create your own plan</span>
          </Button>
          <span className="text-[10px] font-medium leading-none text-muted-foreground sm:hidden">My plan</span>
        </div>
      </div>
    </div>
  );
}
