import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router";

export default function RecommendButton() {
  const navigate = useNavigate();

  const recommendClick = () => {
    navigate("/recommend");
  };

  return (
    <div className="pointer-events-none fixed bottom-7 left-0 right-0 z-50 flex justify-center px-4">
      <Button
        onClick={recommendClick}
        className="pointer-events-auto gap-2.5 rounded-full px-6 py-6 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:text-white"
        style={{
          background: "linear-gradient(135deg, #4f7eff 0%, #3d6eef 100%)",
          boxShadow:
            "0 8px 32px rgba(79,126,255,0.45), 0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        <Sparkles className="h-4 w-4 fill-white/30 text-white" />
        Recommend Diet with AI
      </Button>
    </div>
  );
}
