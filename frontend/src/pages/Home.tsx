import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import Profile from "@/components/profile";
import { AppHeader } from "@/components/header";
import StatBar from "@/components/statBar";
import { DashboardTabs } from "@/components/dashboard/dashboardTabs";
import { useNavigate } from "react-router";
import RecommendButton from "@/components/recommendButton";

// ─── Data ─────────────────────────────────────────────────────────────────────

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

// ─── Active plan meals (macro data per meal) ──────────────────────────────────
const activePlanName = "High Protein Cut — Week 1";
const activePlanGoal = { calories: 2000, protein: 160, carbs: 220, fat: 65 };

const activeMeals = [
  {
    id: "breakfast",
    name: "Breakfast",
    time: "7:30 AM",
    emoji: "🥣",
    ingredients: "Greek yogurt · Oats · Almonds",
    calories: 380,
    protein: 32,
    carbs: 44,
    fat: 11,
  },
  {
    id: "lunch",
    name: "Lunch",
    time: "12:30 PM",
    emoji: "🥗",
    ingredients: "Grilled chicken · Brown rice · Spinach",
    calories: 620,
    protein: 54,
    carbs: 72,
    fat: 14,
  },
  {
    id: "snack",
    name: "Snack",
    time: "3:30 PM",
    emoji: "🍎",
    ingredients: "Cottage cheese · Apple",
    calories: 190,
    protein: 18,
    carbs: 22,
    fat: 4,
  },
  {
    id: "dinner",
    name: "Dinner",
    time: "7:00 PM",
    emoji: "🐟",
    ingredients: "Salmon · Quinoa · Broccoli",
    calories: 790,
    protein: 54,
    carbs: 78,
    fat: 36,
  },
];   
// ─── App ──────────────────────────────────────────────────────────────────────
export default function Home() {
  const [expandedPlan, setExpandedPlan] = useState<string | null>("1");
  const [bookmarked, setBookmarked] = useState(new Set(["1", "2", "3"]));
  const [eatenIds, setEatenIds] = useState<Set<string>>(new Set(["breakfast", "lunch"]));

  const toggleMeal = (id: string) => {
    setEatenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  

  // Derived macros from eaten meals only
  
  const goal = activePlanGoal;
  const r = 46;
  const circ = 2 * Math.PI * r;

  const consumed = useMemo(() => {
    const eaten = activeMeals.filter((m) => eatenIds.has(m.id));
    return {
      calories: eaten.reduce((s, m) => s + m.calories, 0),
      protein: eaten.reduce((s, m) => s + m.protein, 0),
      carbs: eaten.reduce((s, m) => s + m.carbs, 0),
      fat: eaten.reduce((s, m) => s + m.fat, 0),
    };
  }, [eatenIds]);

  const macros = [
    { label: "Protein", value: consumed.protein, max: goal.protein, color: "#4f7eff" },
    { label: "Carbohydrates", value: consumed.carbs, max: goal.carbs, color: "#34d399" },
    { label: "Fat", value: consumed.fat, max: goal.fat, color: "#f59e0b" },
  ];

  const ringMacros = [
    { label: "Protein", value: consumed.protein, max: goal.protein, color: "#4f7eff", unit: "g" },
    { label: "Carbs", value: consumed.carbs, max: goal.carbs, color: "#34d399", unit: "g" },
    { label: "Fat", value: consumed.fat, max: goal.fat, color: "#f59e0b", unit: "g" },
  ];

  // useEffect( () => {
  //   async function 
  // }, [])

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "Inter, sans-serif" }}>

      <AppHeader />

      <main className="mx-auto max-w-lg lg:max-w-4xl lg:w-4xl px-4 pb-28">

        {/* ── Profile Hero ── */}
        <Profile />

        {/* ── Stats Strip ── */}
        {/* <StatBar /> */}

        {/* ── Tabs ── */}
        <DashboardTabs
          consumed={consumed}
          goal={goal}
          radius={r}
          circumference={circ}
          ringMacros={ringMacros}
          macros={macros}
          activePlanName={activePlanName}
          activeMeals={activeMeals}
          eatenIds={eatenIds}
          toggleMeal={toggleMeal}
          savedPlans={savedPlans}
          expandedPlan={expandedPlan}
          setExpandedPlan={setExpandedPlan}
          bookmarked={bookmarked}
          setBookmarked={setBookmarked}
          goalStyle={goalStyle}
        />
      </main>

      {/* ── Floating AI Button ── */}
      <RecommendButton />
    </div>
  );
}
