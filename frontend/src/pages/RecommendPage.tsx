import { useState } from "react";
import {
  ArrowLeft, Sparkles, ChevronDown, ChevronUp,
  BookmarkPlus, BookmarkCheck, AlertCircle,
  Zap, Leaf, Globe,
} from "lucide-react";

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button }    from "@/components/ui/button";
import { Badge }     from "@/components/ui/badge";
import { Label }     from "@/components/ui/label";
import { Progress }  from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import TagField from "@/components/ui/tag-input";
import { cn }        from "@/lib/utils";
import { useNavigate } from "react-router";
import { AppHeader } from "@/components/header";

// ─── Types ────────────────────────────────────────────────────────────────────
type Goal = "cut" | "maintain" | "bulk";
type View = "form" | "loading" | "results";

interface Ingredient {
  name: string;
  amountGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface Meal {
  name: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  ingredients: Ingredient[];
}

export interface GeneratedPlan {
  planId: number;
  label: string;
  description: string;
  icon: "zap" | "leaf" | "globe";
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  meals: Meal[];
}

// ─── Saved profile (simulates Supabase user_profiles row) ────────────────────
const savedProfile: {
  fitnessGoal: Goal;
  healthConditions: string[];
  requiredFoodItems: string[];
  dietaryRestrictions: string[];
} = {
  fitnessGoal: "cut",
  healthConditions: ["Anti-inflammatory"],
  requiredFoodItems: ["chai", "dal"],
  dietaryRestrictions: [],
};

// ─── Mock response (matches POST /getRecommended schema) ──────────────────────
const mockPlans: GeneratedPlan[] = [
  {
    planId: 1, label: "High Protein", icon: "zap",
    description: "Maximises protein synthesis. Ideal for lean muscle retention during a cut.",
    totalCalories: 1980, totalProtein: 162, totalCarbs: 190, totalFat: 52, totalFiber: 26,
    meals: [
      {
        name: "Breakfast", totalCalories: 390, totalProtein: 38, totalCarbs: 42, totalFat: 10, totalFiber: 6,
        ingredients: [
          { name: "Greek yogurt",  amountGrams: 200, calories: 118, protein: 20, carbs: 9,  fat: 0.7 },
          { name: "Rolled oats",   amountGrams: 60,  calories: 228, protein: 8,  carbs: 39, fat: 4   },
          { name: "Almonds",       amountGrams: 20,  calories: 116, protein: 4,  carbs: 4,  fat: 10  },
        ],
      },
      {
        name: "Lunch", totalCalories: 620, totalProtein: 58, totalCarbs: 68, totalFat: 14, totalFiber: 8,
        ingredients: [
          { name: "Chicken breast", amountGrams: 200, calories: 330, protein: 62, carbs: 0,  fat: 7   },
          { name: "Brown rice",     amountGrams: 120, calories: 156, protein: 3,  carbs: 33, fat: 1   },
          { name: "Spinach",        amountGrams: 80,  calories: 18,  protein: 2,  carbs: 3,  fat: 0.3 },
        ],
      },
      {
        name: "Snack", totalCalories: 185, totalProtein: 20, totalCarbs: 18, totalFat: 4, totalFiber: 3,
        ingredients: [
          { name: "Cottage cheese", amountGrams: 150, calories: 130, protein: 18,  carbs: 5,  fat: 3   },
          { name: "Apple",          amountGrams: 120, calories: 62,  protein: 0.3, carbs: 17, fat: 0.2 },
        ],
      },
      {
        name: "Dinner", totalCalories: 785, totalProtein: 56, totalCarbs: 78, totalFat: 28, totalFiber: 9,
        ingredients: [
          { name: "Salmon fillet", amountGrams: 180, calories: 374, protein: 40, carbs: 0,  fat: 22  },
          { name: "Quinoa",        amountGrams: 120, calories: 139, protein: 5,  carbs: 25, fat: 2   },
          { name: "Broccoli",      amountGrams: 150, calories: 51,  protein: 4,  carbs: 10, fat: 0.5 },
        ],
      },
    ],
  },
  {
    planId: 2, label: "Balanced", icon: "leaf",
    description: "Even macro split. Sustainable energy throughout the day without spikes.",
    totalCalories: 1960, totalProtein: 138, totalCarbs: 218, totalFat: 58, totalFiber: 30,
    meals: [
      {
        name: "Breakfast", totalCalories: 420, totalProtein: 28, totalCarbs: 52, totalFat: 14, totalFiber: 7,
        ingredients: [
          { name: "Whole eggs",        amountGrams: 120, calories: 186, protein: 15, carbs: 1,  fat: 13  },
          { name: "Whole wheat toast", amountGrams: 80,  calories: 196, protein: 7,  carbs: 36, fat: 2   },
          { name: "Banana",            amountGrams: 100, calories: 89,  protein: 1,  carbs: 23, fat: 0.3 },
        ],
      },
      {
        name: "Lunch", totalCalories: 640, totalProtein: 42, totalCarbs: 78, totalFat: 18, totalFiber: 10,
        ingredients: [
          { name: "Dal (lentils)", amountGrams: 200, calories: 230, protein: 18,  carbs: 40, fat: 1 },
          { name: "Brown rice",   amountGrams: 120, calories: 156, protein: 3,   carbs: 33, fat: 1 },
          { name: "Curd",         amountGrams: 100, calories: 61,  protein: 3.5, carbs: 5,  fat: 3 },
        ],
      },
      {
        name: "Snack", totalCalories: 200, totalProtein: 8, totalCarbs: 30, totalFat: 6, totalFiber: 5,
        ingredients: [
          { name: "Roasted chana",   amountGrams: 60,  calories: 144, protein: 8, carbs: 24, fat: 2   },
          { name: "Chai (no sugar)", amountGrams: 150, calories: 36,  protein: 2, carbs: 5,  fat: 1.5 },
        ],
      },
      {
        name: "Dinner", totalCalories: 700, totalProtein: 48, totalCarbs: 62, totalFat: 22, totalFiber: 8,
        ingredients: [
          { name: "Paneer",             amountGrams: 150, calories: 357, protein: 27, carbs: 5,  fat: 26 },
          { name: "Roti (whole wheat)", amountGrams: 120, calories: 312, protein: 10, carbs: 62, fat: 4  },
        ],
      },
    ],
  },
  {
    planId: 3, label: "Cultural", icon: "globe",
    description: "Region-specific to India. Traditional foods adapted to your macro targets.",
    totalCalories: 2010, totalProtein: 140, totalCarbs: 230, totalFat: 60, totalFiber: 32,
    meals: [
      {
        name: "Breakfast", totalCalories: 450, totalProtein: 22, totalCarbs: 58, totalFat: 14, totalFiber: 8,
        ingredients: [
          { name: "Moong dal chilla", amountGrams: 150, calories: 198, protein: 14,  carbs: 30, fat: 4   },
          { name: "Curd",             amountGrams: 100, calories: 61,  protein: 3.5, carbs: 5,  fat: 3   },
          { name: "Chai",             amountGrams: 150, calories: 36,  protein: 2,   carbs: 5,  fat: 1.5 },
        ],
      },
      {
        name: "Lunch", totalCalories: 680, totalProtein: 44, totalCarbs: 82, totalFat: 18, totalFiber: 11,
        ingredients: [
          { name: "Rajma",           amountGrams: 200, calories: 266, protein: 17,  carbs: 48, fat: 1   },
          { name: "Brown rice",      amountGrams: 120, calories: 156, protein: 3,   carbs: 33, fat: 1   },
          { name: "Kachumber salad", amountGrams: 100, calories: 35,  protein: 1.5, carbs: 7,  fat: 0.3 },
        ],
      },
      {
        name: "Snack", totalCalories: 220, totalProtein: 12, totalCarbs: 28, totalFat: 6, totalFiber: 5,
        ingredients: [
          { name: "Sprouts chaat",   amountGrams: 120, calories: 126, protein: 9, carbs: 22, fat: 1   },
          { name: "Lassi (low fat)", amountGrams: 200, calories: 74,  protein: 4, carbs: 12, fat: 1.5 },
        ],
      },
      {
        name: "Dinner", totalCalories: 660, totalProtein: 46, totalCarbs: 68, totalFat: 20, totalFiber: 8,
        ingredients: [
          { name: "Chicken curry",      amountGrams: 200, calories: 318, protein: 36, carbs: 8,  fat: 16 },
          { name: "Dal",                amountGrams: 150, calories: 172, protein: 13, carbs: 30, fat: 1  },
          { name: "Roti (whole wheat)", amountGrams: 60,  calories: 156, protein: 5,  carbs: 31, fat: 2  },
        ],
      },
    ],
  },
];

// ─── Plan styling config ──────────────────────────────────────────────────────
const planConfig = {
  zap:  {
    border: "border-primary/30",
    bg:     "bg-primary/[0.06]",
    text:   "text-primary",
    icon:   <Zap  size={15} className="fill-primary/30 text-primary" />,
  },
  leaf: {
    border: "border-emerald-500/30",
    bg:     "bg-emerald-500/[0.06]",
    text:   "text-emerald-400",
    icon:   <Leaf size={15} className="text-emerald-400" />,
  },
  globe:{
    border: "border-amber-500/30",
    bg:     "bg-amber-500/[0.06]",
    text:   "text-amber-400",
    icon:   <Globe size={15} className="text-amber-400" />,
  },
};

// ─── Macro bar targets (from user profile) ────────────────────────────────────
const macroTargets = { protein: 160, carbs: 220, fat: 65 };

// ─── Component ────────────────────────────────────────────────────────────────
export function RecommendPage() {
  // All hooks first — no early returns before this point
  const [view,         setView]         = useState<View>("form");
  const [goal,         setGoal]         = useState<Goal>("cut");
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [conditions,   setConditions]   = useState<string[]>([]);
  const [mustHave,     setMustHave]     = useState<string[]>([]);
  const [imported,     setImported]     = useState(false);
  const [savedIds,     setSavedIds]     = useState<Set<number>>(new Set());
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const navigate = useNavigate()

  // ── Handlers ──
  const handleImport = () => {
    setGoal(savedProfile.fitnessGoal);
    setRestrictions([...savedProfile.dietaryRestrictions]);
    setConditions([...savedProfile.healthConditions]);
    setMustHave([...savedProfile.requiredFoodItems]);
    setImported(true);
  };

  const handleReturn = () => {
    navigate('/')
  }

  const handleGenerate = () => {
    setView("loading");
    setTimeout(() => setView("results"), 2400);
  };

  const handleSave = (plan: GeneratedPlan) => {
    setSavedIds((prev) => new Set([...prev, plan.planId]));

    // handle plan saving here 
    // onSavePlan(plan);
  };

  const onBack = () => {
    navigate('/');
    return;
  }

  const toggleMealExpand = (key: string) =>
    setExpandedMeal((prev) => (prev === key ? null : key));

  // ══════════════════════════════════════════════════════
  //  FORM VIEW
  // ══════════════════════════════════════════════════════
  if (view === "form") {
    return (
      <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
        <AppHeader />

        <main className="mx-auto max-w-lg lg:max-w-4xl lg:w-4xl px-4 pb-28">
          <div className="flex flex-col gap-6">

            {/* ── Use saved fields banner ── */}
            <Card className="border-primary/20 bg-primary/[0.06]">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Use saved fields</p>
                  <p className="text-xs text-muted-foreground">Import restrictions, conditions &amp; foods from your profile</p>
                </div>
                <Button
                  size="sm"
                  variant={imported ? "ghost" : "default"}
                  onClick={handleImport}
                  className="ml-4 shrink-0 gap-1.5 text-xs"
                >
                  {imported
                    ? <><BookmarkCheck size={13} className="text-emerald-400" /> Imported</>
                    : <><Sparkles size={13} /> Import</>}
                </Button>
              </CardContent>
            </Card>

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
              onClick={handleGenerate}
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

  // ══════════════════════════════════════════════════════
  //  LOADING VIEW
  // ══════════════════════════════════════════════════════
  if (view === "loading") {
    const steps = [
      "Fetching regional food data",
      "Applying your constraints",
      "Validating macros",
    ];

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-8 text-center">
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
            Gemini is curating meals from the India regional food list
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

  // ══════════════════════════════════════════════════════
  //  RESULTS VIEW
  // ══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>
      <AppHeader />

      <main className="mx-auto max-w-lg lg:max-w-4xl lg:w-4xl px-4 pb-28 flex flex-col">

        {/* Skipped items notice */}
        <Card className="border-amber-500/20 bg-amber-500/[0.06]">
          <CardContent className="flex items-start gap-2.5 p-3.5">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-amber-400">1 item skipped: </span>
              "chai" could not be included in the High Protein plan due to macro constraints.
            </p>
          </CardContent>
        </Card>

        {/* Plan cards */}
        {mockPlans.map((plan) => {
          const config  = planConfig[plan.icon];
          const isSaved = savedIds.has(plan.planId);

          return (
            <Card key={plan.planId} className={cn(config.border, config.bg)}>
              <CardHeader className="pb-3">
                {/* Plan title row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {/* Icon badge */}
                    <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border bg-background/60", config.border)}>
                      {config.icon}
                    </div>
                    <div>
                      <CardTitle className={cn("text-sm", config.text)}>{plan.label}</CardTitle>
                      <p className="mt-0.5 text-xs text-muted-foreground leading-snug">{plan.description}</p>
                    </div>
                  </div>

                  {/* Save button */}
                  <Button
                    size="sm"
                    variant={isSaved ? "ghost" : "default"}
                    onClick={() => handleSave(plan)}
                    className={cn("shrink-0 gap-1.5 text-xs", isSaved && "text-emerald-400 hover:text-emerald-400")}
                  >
                    {isSaved
                      ? <><BookmarkCheck size={13} /> Saved</>
                      : <><BookmarkPlus  size={13} /> Save</>}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Macro chips */}
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {[
                    { label: "Cal",   value: plan.totalCalories.toLocaleString(), color: "text-foreground"  },
                    { label: "Prot",  value: `${plan.totalProtein}g`,             color: "text-primary"     },
                    { label: "Carbs", value: `${plan.totalCarbs}g`,               color: "text-emerald-400" },
                    { label: "Fat",   value: `${plan.totalFat}g`,                 color: "text-amber-400"   },
                    { label: "Fiber", value: `${plan.totalFiber}g`,               color: "text-purple-400"  },
                  ].map((m) => (
                    <div key={m.label} className="rounded-lg border border-border/50 bg-background/50 px-2 py-1">
                      <span className={cn("block text-xs font-bold leading-none", m.color)} style={{ fontFamily: "DM Mono, monospace" }}>
                        {m.value}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{m.label}</span>
                    </div>
                  ))}
                </div>

                {/* Macro progress bars */}
                <div className="mb-4 flex flex-col gap-2">
                  {[
                    { label: "Protein", value: plan.totalProtein, max: macroTargets.protein, color: "#4f7eff" },
                    { label: "Carbs",   value: plan.totalCarbs,   max: macroTargets.carbs,   color: "#34d399" },
                    { label: "Fat",     value: plan.totalFat,     max: macroTargets.fat,     color: "#f59e0b" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center gap-2">
                      <span className="w-12 shrink-0 text-[11px] text-muted-foreground">{m.label}</span>
                      <Progress value={(m.value / m.max) * 100} indicatorColor={m.color} className="h-1 flex-1" />
                      <span className="w-8 shrink-0 text-right text-[11px] text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
                        {m.value}g
                      </span>
                    </div>
                  ))}
                </div>

                <Separator className="mb-3" />

                {/* Expandable meal list */}
                <div className="flex flex-col">
                  {plan.meals.map((meal, idx) => {
                    const mealKey = `${plan.planId}-${meal.name}`;
                    const isOpen  = expandedMeal === mealKey;
                    const isLast  = idx === plan.meals.length - 1;

                    return (
                      <div key={mealKey}>
                        {/* Meal row — tap to expand */}
                        <button
                          onClick={() => toggleMealExpand(mealKey)}
                          className="flex w-full items-center justify-between py-2 text-left"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-foreground">{meal.name}</span>
                            <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
                              {meal.totalCalories} kcal · {meal.totalProtein}g P
                            </span>
                          </div>
                          {isOpen ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
                        </button>

                        {/* Ingredient breakdown */}
                        {isOpen && (
                          <div className="mb-2 flex flex-col gap-1.5 rounded-xl border border-border/50 bg-background/40 p-3">
                            {meal.ingredients.map((ing) => (
                              <div key={ing.name} className="flex items-center justify-between gap-2">
                                <div className="flex min-w-0 items-baseline gap-1.5">
                                  <span className="truncate text-xs font-medium text-foreground">{ing.name}</span>
                                  <span className="shrink-0 text-[11px] text-muted-foreground">{ing.amountGrams}g</span>
                                </div>
                                <div className="flex shrink-0 items-center gap-2.5">
                                  <span className="text-[11px] text-primary" style={{ fontFamily: "DM Mono, monospace" }}>{ing.protein}g P</span>
                                  <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>{ing.calories} kcal</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!isLast && !isOpen && <Separator />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}

       <div className="pointer-events-none fixed bottom-7 left-0 right-0 z-50 flex justify-center px-4">
      <Button
        onClick={handleReturn}
        className="pointer-events-auto gap-2.5 rounded-full px-6 py-6 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:text-white"
        style={{
          background: "linear-gradient(135deg, #4f7eff 0%, #3d6eef 100%)",
          boxShadow:
            "0 8px 32px rgba(79,126,255,0.45), 0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        Home
      </Button>
    </div>
        <p className="px-4 text-center text-xs text-muted-foreground">
          Macros validated server-side. Plans are session-only — save before leaving.
        </p>

        
      </main>
    </div>
  );
}
