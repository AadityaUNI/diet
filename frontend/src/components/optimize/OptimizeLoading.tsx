import { BrainCircuit, Check } from "lucide-react";
import { AppHeader } from "@/components/header";

const steps = ["Reading your current plan", "Checking goals and macro balance", "Planning your requested changes"];

export function OptimizeLoading() {
  return (
    <div className="min-h-screen bg-transparent">
      <AppHeader loading={true} />
      <main className="flex min-h-[70vh] flex-col items-center justify-center px-8 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/15 text-primary">
          <BrainCircuit size={34} className="animate-pulse" />
          <div className="absolute inset-0 animate-ping rounded-3xl border-2 border-primary/25" />
        </div>
        <p className="mt-7 font-outfit text-xl font-bold">Working on your plan</p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">Checking the balance and preparing useful changes.</p>
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 text-left">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card/70 px-3 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Check size={13} /></span>
              <span className="text-xs text-muted-foreground">{step}</span>
              <span className={`ml-auto h-1.5 w-1.5 rounded-full bg-primary ${index === steps.length - 1 ? "animate-pulse" : ""}`} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
