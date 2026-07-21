import { Sparkles, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import TagField from "@/components/ui/tag-input";
import { AppHeader } from "@/components/header";
import { ImportProfileBanner } from "@/components/recommend/ImportProfileBanner";
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
  onImport: () => void;
  onGenerate: () => void;
}

export function RecommendForm({
  goal, setGoal,
  loadingUser,
  restrictions, setRestrictions,
  conditions, setConditions,
  mustHave, setMustHave,
  imported, onImport,
  onGenerate,
}: RecommendFormProps) {
  console.log("Retrived conditions: ", conditions)
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
      <AppHeader loading={loadingUser} />

      <main className="mx-auto max-w-lg lg:max-w-4xl lg:w-4xl px-4 pb-28">
        <div className="flex flex-col gap-6">

          {!loadingUser && <ImportProfileBanner imported={imported} onImport={onImport} />} 

          {/* ── Fitness goal ── */}
          <div className="flex flex-col gap-2 w-auto">
            <Label htmlFor="goal-select">Fitness Goal</Label>
            <Select value={goal} onValueChange={(v) => setGoal(v as Goal)}>
              <SelectTrigger className="w-[300px]" id="goal-select">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cut">Cut — Lose fat, keep muscle</SelectItem>
                <SelectItem value="maintain">Maintain — Hold current weight</SelectItem>
                <SelectItem value="bulk">Bulk — Gain muscle mass</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ── Dietary restrictions ── */}
          <div className="flex flex-col gap-2">
            <Label>Dietary Restrictions</Label>
            <p className="text-xs text-muted-foreground -mt-1">e.g. vegetarian, gluten-free, dairy-free</p>
            <TagField
              values={restrictions}
              onChange={setRestrictions}
              placeholder="Type and press Enter…"
            />
          </div>

          {/* ── Health conditions ── */}
          <div className="flex flex-col gap-2">
            <Label>Health Conditions</Label>
            <p className="text-xs text-muted-foreground -mt-1">e.g. RA, anti-inflammatory, diabetes</p>
            <TagField
              values={conditions}
              onChange={setConditions}
              placeholder="Type and press Enter…"
            />
          </div>

          {/* ── Must-have foods ── */}
          <div className="flex flex-col gap-2">
            <Label>Must-Have Foods</Label>
            <p className="text-xs text-muted-foreground -mt-1">Foods that must appear somewhere in your plan</p>
            <TagField
              values={mustHave}
              onChange={setMustHave}
              placeholder="e.g. chai, dal, eggs…"
            />
          </div>

          {/* ── Region note ── */}
          <Card className="border-border bg-secondary/20">
            <CardContent className="flex items-start gap-2 p-3">
              <Globe size={13} className="mt-0.5 shrink-0 text-muted-foreground" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Using <span className="font-semibold text-foreground">India</span> regional food data from your profile.
              </p>
            </CardContent>
          </Card>

          {/* ── Generate button ── */}
          <Button
            onClick={onGenerate}
            className="w-full gap-2 py-6 text-sm"
            style={{ boxShadow: "0 8px 24px rgba(79,126,255,0.35)" }}
          >
            <Sparkles size={17} />
            Generate My Plans
          </Button>

        </div>
      </main>
    </div>
  );
}
