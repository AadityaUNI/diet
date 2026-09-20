import { ArrowLeft, Check, CircleAlert, Equal, Lightbulb, RotateCcw } from "lucide-react";
import { AppHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalyzeResponse } from "@/auth/RecommendGen";
import type { FullPlanData } from "@/types/types";

type OptimizeResultsProps = {
  plan: FullPlanData;
  result: AnalyzeResponse;
  saving: boolean;
  saveError: string | null;
  onAccept: () => void;
  onKeepCurrent: () => void;
  onBack: () => void;
};

const categoryLabels = { amount: "Amount adjustment", ingredient: "Ingredient change", meal: "Meal change" } as const;

export function OptimizeResults({ plan, result, saving, saveError, onAccept, onKeepCurrent, onBack }: OptimizeResultsProps) {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <AppHeader loading={false} />
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 pb-28 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Plan change review</p>
            <h1 className="mt-1 font-outfit text-2xl font-bold leading-tight">A clearer path for {plan.name}</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onBack} aria-label="Back to plan changes"><ArrowLeft size={18} /></Button>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex gap-3 p-5">
            <Lightbulb className="mt-0.5 shrink-0 text-primary" size={19} />
            <div><p className="text-sm font-semibold">What the review found</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{result.summary}</p></div>
          </CardContent>
        </Card>

        <section className="space-y-2">
          <div className="flex items-center gap-2"><CircleAlert size={16} className="text-amber-500" /><h2 className="font-outfit text-base font-bold">Priorities to address</h2></div>
          {result.missing.length > 0 ? result.missing.map((item) => <div key={item} className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm text-muted-foreground">{item}</div>) : <div className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm text-muted-foreground">No major gaps were identified.</div>}
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2"><Check size={16} className="text-emerald-500" /><h2 className="font-outfit text-base font-bold">Recommended changes</h2></div>
          {result.changes.length > 0 ? result.changes.map((change, index) => <Card key={`${change.title}-${index}`} className="border-border/70 bg-card/70"><CardContent className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">{categoryLabels[change.category]}{change.meal_name ? ` · ${change.meal_name}` : ""}</p><p className="mt-1 text-sm font-semibold">{change.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{change.description}</p></div><Equal size={15} className="mt-1 shrink-0 text-muted-foreground" /></div></CardContent></Card>) : <div className="rounded-xl border border-border/70 bg-card/70 px-4 py-3 text-sm text-muted-foreground">The current plan is already close to its targets.</div>}
        </section>

        {result.proposed_plan && <Card className="border-border bg-card/80"><CardContent className="p-4"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Proposed totals</p><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{[["Calories", result.proposed_plan.total_calories.toFixed(0)], ["Protein", `${result.proposed_plan.total_protein.toFixed(1)}g`], ["Carbs", `${result.proposed_plan.total_carbs.toFixed(1)}g`], ["Fat", `${result.proposed_plan.total_fats.toFixed(1)}g`]].map(([label, value]) => <div key={label} className="rounded-lg bg-secondary/50 px-3 py-2"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div>)}</div></CardContent></Card>}

        {saveError && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{saveError}</div>}
        <div className="flex flex-col gap-2 sm:flex-row"><Button onClick={onAccept} disabled={saving || !result.proposed_plan} className="flex-1 gap-2"><Check size={16} />{saving ? "Saving changes..." : "Accept changes"}</Button><Button variant="outline" onClick={onKeepCurrent} disabled={saving} className="flex-1 gap-2"><RotateCcw size={16} />Keep current plan</Button></div>
      </main>
    </div>
  );
}
