// components/dashboard/calorie-ring-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalorieRingCardProps {
  consumed: { calories: number };
  goal: { calories: number; planCalories: number };
}

export function CalorieRingCard({ consumed, goal }: CalorieRingCardProps) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const ratio = goal.calories > 0 ? consumed.calories / goal.calories : 0;
  const pct = Math.round(ratio * 100);
  const rows = [
    { label: "Goal", value: goal.calories, color: "bg-foreground/35" },
    { label: "Plan", value:goal.planCalories, color: "bg-chart-2" },
    { label: "Consumed", value: consumed.calories, color: "bg-chart-1" },
    { label: "Remaining", value: goal.calories - consumed.calories, color: "bg-chart-3" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today's Calories</CardTitle>
          <span className="font-mono text-xs font-semibold text-chart-1">{pct}% of goal</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 pt-4 md:flex-row md:items-center md:gap-6">
        <div className="relative hidden shrink-0 p-2 md:block" style={{ width: 126, height: 126 }}>
          <svg width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={55} cy={55} r={radius} fill="none" stroke="color-mix(in oklch, var(--chart-1) 18%, transparent)" strokeWidth={10} />
            <circle
              cx={55} cy={55} r={radius} fill="none" stroke="var(--chart-1)"
              strokeWidth={10} strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - Math.min(Math.max(ratio, 0), 1))}
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-outfit text-[19px] font-bold leading-none">
              {pct.toLocaleString()}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:hidden">
          <div className="h-3 w-full overflow-hidden rounded-4xl bg-muted">
            <div
              className="h-full rounded-4xl bg-chart-1 transition-all duration-1000"
              style={{ width: `${Math.min(Math.max(ratio * 100, 0), 100)}%` }}
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${row.color}`} />
                <span className="text-xs text-muted-foreground">{row.label}</span>
              </div>
              <span className="font-mono text-xs font-bold">{row.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}