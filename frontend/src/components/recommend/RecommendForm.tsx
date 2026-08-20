import { Check, Globe, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import TagField from "@/components/ui/tag-input";
import { AppHeader } from "@/components/header";
import type { Goal } from "@/types/generated-plan";

interface RecommendFormProps {
  goal: Goal;
  loadingUser: boolean;
  setGoal: (goal: Goal) => void;
  restrictions: string[];
  setRestrictions: (values: string[]) => void;
  conditions: string[];
  setConditions: (values: string[]) => void;
  mustHave: string[];
  setMustHave: (values: string[]) => void;
  imported: boolean;
  onGenerate: () => void;
}

export function RecommendForm({
  goal, setGoal,
  loadingUser,
  restrictions, setRestrictions,
  conditions, setConditions,
  mustHave, setMustHave,
  imported,
  onGenerate,
}: RecommendFormProps) {
  return (
    <div className="min-h-screen bg-transparent text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
      <AppHeader loading={loadingUser} />

      <main className="mx-auto max-w-5xl px-4 pb-8">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Plan studio</p><h1 className="font-outfit text-2xl font-bold">Shape your recommendation</h1></div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Check size={14} className="text-emerald-500" /> {loadingUser ? "Loading profile" : imported ? "Profile loaded" : "Custom setup"}</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Card className="border-border bg-card/80">
            <CardContent className="p-5">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">01 / Direction</p>
              <h2 className="mb-4 font-outfit text-lg font-bold">What are you working toward?</h2>
              <div className="grid gap-2">
                {([
                  ["cut", "Cut", "Lose fat while keeping muscle"],
                  ["maintain", "Maintain", "Hold your current weight"],
                  ["bulk", "Bulk", "Build muscle and gain mass"],
                ] as const).map(([value, label, description]) => (
                  <button key={value} type="button" onClick={() => setGoal(value)} className={`rounded-xl border p-3 text-left transition-colors ${goal === value ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}>
                    <span className="flex items-center justify-between text-sm font-semibold">{label}{goal === value && <Check size={15} className="text-primary" />}</span>
                    <span className="text-xs text-muted-foreground">{description}</span>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex items-start gap-2 rounded-lg bg-secondary/40 p-3"><Globe size={14} className="mt-0.5 shrink-0 text-primary" /><p className="text-xs text-muted-foreground">Using regional food data from your saved profile.</p></div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/80">
            <CardContent className="grid gap-4 p-5">
              <div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">02 / Guardrails</p><h2 className="font-outfit text-lg font-bold">Tune the ingredients</h2></div>

              <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold">Dietary Restrictions</Label>
            <TagField
              values={restrictions}
              onChange={setRestrictions}
              placeholder="Type and press Enter…"
            />
          </div>

          {/* ── Health conditions ── */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold">Health Conditions</Label>
            <TagField
              values={conditions}
              onChange={setConditions}
              placeholder="Type and press Enter…"
            />
          </div>

          {/* ── Must-have foods ── */}
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label className="text-xs font-semibold">Must-Have Foods</Label>
            <TagField
              values={mustHave}
              onChange={setMustHave}
              placeholder="e.g. chai, dal, eggs…"
            />
          </div>
              </div>
          <Button
            onClick={onGenerate}
            className="w-full gap-2 py-6 text-sm"
          >
            <Sparkles size={17} />
            Generate My Plans
          </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
