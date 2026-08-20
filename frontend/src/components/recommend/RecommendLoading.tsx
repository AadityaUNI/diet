import { Sparkles } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
const steps = [
  "Fetching regional food data",
  "Applying your constraints",
  "Validating macros",
];

export function RecommendLoading() {
  const {region} = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-transparent px-8 text-center">
      <style>{`
        @keyframes dietgrid-fill {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>

      {/* Pulsing icon */}
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
        <Sparkles size={28} className="animate-pulse text-primary" />
        <div className="absolute inset-0 animate-ping rounded-2xl border-2 border-primary/25" />
      </div>

      {/* Copy */}
      <div>
        <p className="text-base font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
          Generating your plans…
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Gemini is curating meals from the {region} regional food list
        </p>
      </div>

      {/* Step progress bars */}
      <div className="w-full max-w-xs flex flex-col gap-3">
        {steps.map((step, i) => (
          <div key={step} className="flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary"
                style={{ animation: `dietgrid-fill 0.9s ease ${i * 0.7}s both` }}
              />
            </div>
            <span className="w-36 text-left text-[10px] text-muted-foreground">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
