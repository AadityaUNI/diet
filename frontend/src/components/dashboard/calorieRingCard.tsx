// components/dashboard/calorie-ring-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalorieRingCardProps {
  consumed: { calories: number };
  goal: { calories: number };
}

export function CalorieRingCard({ consumed, goal }: CalorieRingCardProps) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.round((consumed.calories / goal.calories) * 100);
  const rows = [
    { label: "Goal", value: goal.calories, color: "bg-secondary" },
    { label: "Consumed", value: consumed.calories, color: "bg-primary" },
    { label: "Remaining", value: goal.calories - consumed.calories, color: "bg-emerald-500" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Today's Calories</CardTitle>
          <span className="font-mono text-xs text-muted-foreground">{pct}% of goal</span>
        </div>
      </CardHeader>
      <CardContent className="flex items-center gap-5 pt-4">
        <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
          <svg width={110} height={110} style={{ transform: "rotate(-90deg)" }}>
            <circle cx={55} cy={55} r={radius} fill="none" stroke="rgba(79,126,255,0.08)" strokeWidth={10} />
            <circle
              cx={55} cy={55} r={radius} fill="none" stroke="#4f7eff"
              strokeWidth={10} strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - consumed.calories / goal.calories)}
              style={{ transition: "stroke-dashoffset 1.2s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-outfit text-[19px] font-bold leading-none">
              {consumed.calories.toLocaleString()}
            </span>
            <span className="mt-0.5 text-xs text-muted-foreground">kcal</span>
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