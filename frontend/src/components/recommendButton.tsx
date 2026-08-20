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
      <div className="pointer-events-auto flex w-full max-w-lg flex-col gap-3 sm:flex-row">
        <Button
          onClick={recommendClick}
          className="flex-1 gap-2.5 rounded-full px-6 py-6 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5"
        >
          <Sparkles className="h-4 w-4 fill-primary-foreground/30 text-primary-foreground" />
          Recommend Diet with AI
        </Button>

        <Button
          onClick={createPlanClick}
          variant="secondary"
          className="flex-1 gap-2.5 rounded-full px-6 py-6 text-sm font-semibold"
        >
          <PencilLine className="h-4 w-4" />
          Create your own plan
        </Button>
      </div>
    </div>
  );
}
