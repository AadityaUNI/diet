import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import {
  Flame, TrendingUp, Calendar, Bolt, Lock, Star,
  Sparkles, Bookmark, BookmarkCheck, CheckCircle2,
  Circle, Trash2, Flag, Bell, Settings, Edit3, Share2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// ─── Data ─────────────────────────────────────────────────────────────────────
const weeklyCalories = [
  { day: "Mon", calories: 1820, goal: 2000 },
  { day: "Tue", calories: 2100, goal: 2000 },
  { day: "Wed", calories: 1760, goal: 2000 },
  { day: "Thu", calories: 1950, goal: 2000 },
  { day: "Fri", calories: 2200, goal: 2000 },
  { day: "Sat", calories: 1680, goal: 2000 },
  { day: "Sun", calories: 1920, goal: 2000 },
];
// added comment 
// another

const macros = [
  { label: "Protein", value: 142, max: 160, color: "#4f7eff" },
  { label: "Carbohydrates", value: 198, max: 220, color: "#34d399" },
  { label: "Fat", value: 52, max: 65, color: "#f59e0b" },
];

const ringMacros = [
  { label: "Protein", value: 142, max: 160, color: "#4f7eff", unit: "g" },
  { label: "Carbs", value: 198, max: 220, color: "#34d399", unit: "g" },
  { label: "Fat", value: 52, max: 65, color: "#f59e0b", unit: "g" },
  { label: "Water", value: 2.1, max: 3, color: "#a78bfa", unit: "L" },
];

const achievements = [
  { icon: "🔥", label: "7-Day Streak", unlocked: true },
  { icon: "💧", label: "Hydration Pro", unlocked: true },
  { icon: "🏆", label: "30-Day Goal", unlocked: true },
  { icon: "⚡", label: "Macro Master", unlocked: false },
  { icon: "🌙", label: "Night Planner", unlocked: false },
  { icon: "📊", label: "Data Nerd", unlocked: false },
];

const savedPlans = [
  {
    id: "1",
    name: "High Protein Cut — Week 1",
    date: "Jun 24, 2026",
    isTemplate: false,
    totalCalories: 1980,
    protein: 158,
    carbs: 195,
    fat: 54,
    goal: "cut" as const,
    conditions: ["Anti-inflammatory"],
    meals: [
      { name: "Breakfast", calories: 380, done: true, ingredients: "Greek yogurt · Oats · Almonds" },
      { name: "Lunch", calories: 620, done: true, ingredients: "Grilled chicken · Brown rice · Spinach" },
      { name: "Snack", calories: 190, done: false, ingredients: "Cottage cheese · Apple" },
      { name: "Dinner", calories: 790, done: false, ingredients: "Salmon · Quinoa · Broccoli" },
    ],
  },
  {
    id: "2",
    name: "Balanced Maintenance Plan",
    date: "Jun 20, 2026",
    isTemplate: true,
    totalCalories: 2100,
    protein: 140,
    carbs: 240,
    fat: 62,
    goal: "maintain" as const,
    conditions: [],
    meals: [
      { name: "Breakfast", calories: 420, done: true, ingredients: "Dal · Roti · Curd" },
      { name: "Lunch", calories: 680, done: true, ingredients: "Rajma · Brown rice · Salad" },
      { name: "Snack", calories: 210, done: true, ingredients: "Roasted chana · Chai" },
      { name: "Dinner", calories: 790, done: true, ingredients: "Paneer tikka · Roti · Sabzi" },
    ],
  },
  {
    id: "3",
    name: "Cultural Bulk — India",
    date: "Jun 15, 2026",
    isTemplate: false,
    totalCalories: 2680,
    protein: 175,
    carbs: 310,
    fat: 72,
    goal: "bulk" as const,
    conditions: ["RA"],
    meals: [
      { name: "Breakfast", calories: 560, done: false, ingredients: "Egg bhurji · Paratha · Milk" },
      { name: "Lunch", calories: 820, done: false, ingredients: "Chicken curry · Rice · Dal" },
      { name: "Snack", calories: 340, done: false, ingredients: "Banana · Peanut butter · Oats" },
      { name: "Dinner", calories: 960, done: false, ingredients: "Mutton keema · Roti · Salad" },
    ],
  },
];

const goalStyle = {
  cut: { color: "#4f7eff", label: "Cut" },
  maintain: { color: "#34d399", label: "Maintain" },
  bulk: { color: "#f59e0b", label: "Bulk" },
};

// ─── Small Components ─────────────────────────────────────────────────────────
function MacroRing({ label, value, max, color, unit, size = 80 }: {
  label: string; value: number; max: number;
  color: string; unit: string; size?: number;
}) {
  const sw = 7;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(value / max, 1));
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(79,126,255,0.1)" strokeWidth={sw} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
            strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-bold text-foreground leading-none" style={{ fontFamily: "DM Mono, monospace" }}>
            {value}
          </span>
          <span className="text-[9px] text-muted-foreground">{unit}</span>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
        {payload[0].value} kcal
      </p>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [expandedPlan, setExpandedPlan] = useState<string | null>("1");
  const [bookmarked, setBookmarked] = useState(new Set(["1", "2", "3"]));

  const consumed = 1750;
  const goal = 2000;
  const r = 46;
  const circ = 2 * Math.PI * r;

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>

      {/* ── Nav ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <Bolt size={14} className="fill-white text-white" />
            </div>
            <span className="text-base font-bold" style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "-0.02em" }}>
              Diet<span className="text-primary">Grid</span>
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={16} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings size={16} />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-28">

        {/* ── Profile Hero ── */}
        <section className="py-6">
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=160&h=160&fit=crop&auto=format"
                  alt="Alex Morgan"
                />
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-primary text-[8px] text-white">
                ✓
              </span>
            </div>

            <div className="flex-1 pt-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold leading-none" style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "-0.03em" }}>
                  Alex Morgan
                </h1>
                <Badge>PRO</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">@alexmorgan · Member since Jan 2024</p>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground/60">
                Cutting phase · 78kg → 74kg · High protein · India
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <Button className="flex-1 gap-1.5" size="sm">
              <Edit3 size={13} /> Edit Profile
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Share2 size={13} /> Share
            </Button>
          </div>
        </section>

        {/* ── Stats Strip ── */}
        <div className="mb-5 grid grid-cols-3 gap-2.5">
          {[
            { label: "Streak", value: "24", unit: "days", icon: <Flame size={14} className="text-orange-400" /> },
            { label: "Avg Cal", value: "1,890", unit: "kcal", icon: <TrendingUp size={14} className="text-primary" /> },
            { label: "Plans", value: "3", unit: "saved", icon: <Calendar size={14} className="text-emerald-400" /> },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  {s.icon}
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {s.label}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {s.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{s.unit}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
          </TabsList>

          {/* ════════════ OVERVIEW ════════════ */}
          <TabsContent value="overview" className="flex flex-col gap-4">

            {/* Calorie ring */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Today's Calories</CardTitle>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
                    {Math.round((consumed / goal) * 100)}% of goal
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-5 pt-4">
                <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
                  <svg width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
                    <circle cx={55} cy={55} r={r} fill="none" stroke="rgba(79,126,255,0.08)" strokeWidth={10} />
                    <circle
                      cx={55} cy={55} r={r} fill="none" stroke="#4f7eff"
                      strokeWidth={10} strokeLinecap="round"
                      strokeDasharray={circ}
                      strokeDashoffset={circ * (1 - consumed / goal)}
                      style={{ transition: "stroke-dashoffset 1.2s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold leading-none" style={{ fontFamily: "Outfit, sans-serif" }}>
                      {consumed.toLocaleString()}
                    </span>
                    <span className="mt-0.5 text-[11px] text-muted-foreground">kcal</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3">
                  {[
                    { label: "Goal", value: goal, color: "bg-secondary" },
                    { label: "Consumed", value: consumed, color: "bg-primary" },
                    { label: "Remaining", value: goal - consumed, color: "bg-emerald-500" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${row.color}`} />
                        <span className="text-xs text-muted-foreground">{row.label}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ fontFamily: "DM Mono, monospace" }}>
                        {row.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Macros */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Macros</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-5 flex justify-around">
                  {ringMacros.map((m) => (
                    <MacroRing key={m.label} {...m} />
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  {macros.map((m) => (
                    <div key={m.label}>
                      <div className="mb-1.5 flex justify-between">
                        <span className="text-xs text-muted-foreground">{m.label}</span>
                        <span className="text-xs font-semibold" style={{ fontFamily: "DM Mono, monospace", color: m.color }}>
                          {m.value}g / {m.max}g
                        </span>
                      </div>
                      
                     <Progress 
  value={(m.value / m.max) * 100} 
  indicatorColor={m.color} 
/>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Weekly Calories</CardTitle>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
                    Avg 1,918
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-3">
                <p className="mb-3 text-xs text-muted-foreground">Past 7 days vs. 2,000 kcal goal</p>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={weeklyCalories} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                    <defs>
                      <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f7eff" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#4f7eff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#6b82a8", fontFamily: "DM Mono, monospace" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#6b82a8", fontFamily: "DM Mono, monospace" }} axisLine={false} tickLine={false} domain={[1400, 2400]} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="goal" stroke="#6b82a8" strokeWidth={1} strokeDasharray="4 4" fill="transparent" dot={false} />
                    <Area type="monotone" dataKey="calories" stroke="#4f7eff" strokeWidth={2.5} fill="url(#calGrad)"
                      dot={{ fill: "#4f7eff", strokeWidth: 0, r: 3 }}
                      activeDot={{ r: 5, fill: "#4f7eff", stroke: "#0d1628", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

           
          </TabsContent>

          {/* ════════════ SAVED ════════════ */}
          <TabsContent value="saved" className="flex flex-col gap-4">

            {/* Header row */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>Saved Plans</h2>
                <p className="text-xs text-muted-foreground">AI-generated · tap to expand</p>
              </div>
              <Badge className="font-mono text-xs" style={{ fontFamily: "DM Mono, monospace" }}>
                {savedPlans.length} plans
              </Badge>
            </div>

            {/* Plan cards */}
            {savedPlans.map((plan) => {
              const isOpen = expandedPlan === plan.id;
              const gs = goalStyle[plan.goal];
              const doneCount = plan.meals.filter((m) => m.done).length;
              const allDone = doneCount === plan.meals.length;

              return (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-colors ${isOpen ? "border-primary/40" : ""}`}
                  onClick={() => setExpandedPlan(isOpen ? null : plan.id)}
                >
                  <CardContent className="p-4">

                    {/* Plan header row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-sm leading-snug" style={{ fontFamily: "Outfit, sans-serif" }}>
                            {plan.name}
                          </span>
                          {/* {plan.isTemplate && <Badge variant="purple">Template</Badge>} REMOVED TEMPLATE BADGE*/} 
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                          <span>{plan.date}</span>
                          <span className="text-border">·</span>
                          <span className="flex items-center gap-1 font-semibold" style={{ color: gs.color }}>
                            <Flag size={10} /> {gs.label}
                          </span>
                          {plan.conditions.length > 0 && (
                            <>
                              <span className="text-border">·</span>
                              <span>{plan.conditions[0]}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <button
                        className="shrink-0 text-muted-foreground hover:text-primary transition-colors p-0.5"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookmarked((prev) => {
                            const next = new Set(prev);
                            next.has(plan.id) ? next.delete(plan.id) : next.add(plan.id);
                            return next;
                          });
                        }}
                      >
                        {bookmarked.has(plan.id)
                          ? <BookmarkCheck size={17} className="text-primary" />
                          : <Bookmark size={17} />}
                      </button>
                    </div>

                    {/* Macro chips */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[
                        { label: "Cal", value: plan.totalCalories.toLocaleString(), color: "text-foreground" },
                        { label: "Prot", value: `${plan.protein}g`, color: "text-primary" },
                        { label: "Carbs", value: `${plan.carbs}g`, color: "text-emerald-400" },
                        { label: "Fat", value: `${plan.fat}g`, color: "text-amber-400" },
                      ].map((m) => (
                        <div key={m.label} className="rounded-lg bg-secondary/50 px-2 py-1">
                          <span className={`block text-[11px] font-bold leading-none ${m.color}`} style={{ fontFamily: "DM Mono, monospace" }}>
                            {m.value}
                          </span>
                          <span className="text-[9px] text-muted-foreground">{m.label}</span>
                        </div>
                      ))}
                      <div className="ml-auto rounded-lg bg-secondary/50 px-2 py-1">
                        <span className={`block text-[11px] font-bold leading-none ${allDone ? "text-emerald-400" : "text-muted-foreground"}`} style={{ fontFamily: "DM Mono, monospace" }}>
                          {doneCount}/{plan.meals.length}
                        </span>
                        <span className="text-[9px] text-muted-foreground">done</span>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isOpen && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <Separator className="my-4" />
                        <div className="flex flex-col gap-3">
                          {plan.meals.map((meal, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className={`mt-0.5 shrink-0 ${meal.done ? "text-emerald-400" : "text-muted-foreground"}`}>
                                {meal.done
                                  ? <CheckCircle2 size={17} />
                                  : <Circle size={17} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-sm font-semibold ${meal.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                                    {meal.name}
                                  </span>
                                  <span className="shrink-0 text-xs text-muted-foreground" style={{ fontFamily: "DM Mono, monospace" }}>
                                    {meal.calories} kcal
                                  </span>
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">{meal.ingredients}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Button className="flex-1" size="sm">
                            Use this Plan
                          </Button>
                          <Button variant="destructive" size="icon" className="shrink-0">
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            {/* Nudge card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.08] to-transparent">
              <CardContent className="p-4 text-center">
                <Star size={20} className="mx-auto mb-2 fill-amber-400 text-amber-400" />
                <p className="mb-1 text-sm font-semibold" style={{ fontFamily: "Outfit, sans-serif" }}>
                  Generate more plans
                </p>
                <p className="text-xs text-muted-foreground">
                  Hit the button below to get a new AI-recommended diet tailored to your goals.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ── Floating AI Button ── */}
      <div className="pointer-events-none fixed bottom-7 left-0 right-0 z-50 flex justify-center px-4">
        <button
          className="pointer-events-auto flex items-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5"
          style={{
            background: "linear-gradient(135deg, #4f7eff 0%, #3d6eef 100%)",
            boxShadow: "0 8px 32px rgba(79,126,255,0.45), 0 2px 8px rgba(0,0,0,0.4)",
          }}
        >
          <Sparkles size={17} className="fill-white/30 text-white" />
          Recommend Diet with AI
        </button>
      </div>
    </div>
  );
}
