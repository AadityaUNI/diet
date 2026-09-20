import { ArrowRight, MessageSquareText, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FullPlanData } from "@/types/types";

type OptimizeFormProps = {
  plan: FullPlanData;
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fibre: number;
  };
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSubmit: () => void;
};

export function OptimizeForm({ plan, targets, prompt, onPromptChange, onSubmit }: OptimizeFormProps) {
  const comparisons = [
    { label: "Calories", plan: plan.total_calories, target: targets.calories, unit: "kcal", color: "text-primary", background: "bg-primary/10" },
    { label: "Protein", plan: plan.total_protein, target: targets.protein, unit: "g", color: "text-chart-1", background: "bg-chart-1/10" },
    { label: "Carbs", plan: plan.total_carbs, target: targets.carbs, unit: "g", color: "text-chart-2", background: "bg-chart-2/10" },
    { label: "Fat", plan: plan.total_fats, target: targets.fat, unit: "g", color: "text-chart-3", background: "bg-chart-3/10" },
    { label: "Fibre", plan: plan.total_fibre, target: targets.fibre, unit: "g", color: "text-chart-4", background: "bg-chart-4/10" },
  ];

  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <AppHeader loading={false} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 pb-28 pt-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Plan changes</p>
          <h1 className="mt-1 font-outfit text-3xl font-bold leading-tight">Make this plan fit your needs.</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Tell DietGrid what you want to change, or leave a note blank for a general review and balance check.
          </p>
        </div>

        <Card className="overflow-hidden border-primary/20 bg-card/80 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Selected plan</p>
                <h2 className="mt-1 truncate font-outfit text-xl font-bold">{plan.name}</h2>
              </div>
              </div>
              <div className="mt-5 space-y-2">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  <span>Daily target comparison</span>
                  <span>Plan</span>
                  <span>Target</span>
                </div>
                {comparisons.map((comparison) => (
                  <div key={comparison.label} className={`grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl px-3 py-2.5 ${comparison.background}`}>
                    <span className={`text-sm font-semibold ${comparison.color}`}>{comparison.label}</span>
                    <span className="text-sm font-bold tabular-nums text-foreground">{comparison.plan.toFixed(0)}{comparison.unit}</span>
                    <span className="text-sm tabular-nums text-muted-foreground">{comparison.target.toFixed(0)}{comparison.unit}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/80">
          <CardContent className="space-y-4 p-5 sm:p-6">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><MessageSquareText size={18} /></div>
              <div>
                <Label htmlFor="optimizer-prompt" className="font-outfit text-base font-bold">What would you like to change?</Label>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Optional. Ask for anything, such as adding a meal or changing an ingredient.</p>
              </div>
            </div>
            <Textarea
              id="optimizer-prompt"
              value={prompt}
              onChange={(event) => onPromptChange(event.target.value)}
              placeholder="e.g. Add a high-protein afternoon meal"
              className="min-h-28 resize-none bg-background/60"
              maxLength={500}
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{prompt.length}/500</span>
              <span>{plan.meals.length} meals will be reviewed</span>
            </div>
            <Button onClick={onSubmit} className="w-full gap-2 py-6 text-sm">
              <Sparkles size={17} />
              Review and make changes
              <ArrowRight size={16} />
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
