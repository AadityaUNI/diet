import { Flame } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { UserProfile } from "@/types/types"

interface MacroDatum {
  key: "protein" | "carbs" | "fat"
  label: string
  grams: number
  caloriesPerGram: number
  colorVar: string
}

interface GoalStatsCardProps {
  calorieTarget: number | null
  goalLabel: string
  userData: UserProfile
}

export function GoalStatsCard({ calorieTarget, goalLabel, userData }: GoalStatsCardProps) {
  // Colors intentionally match the chart-N → macro mapping documented in index.css
  const macros: MacroDatum[] = [
    { key: "protein", label: "Protein", grams: Number(userData.protein_target) ?? 0, caloriesPerGram: 4, colorVar: "var(--chart-1)" },
    { key: "carbs", label: "Carbs", grams: Number(userData.carbs_target) ?? 0, caloriesPerGram: 4, colorVar: "var(--chart-2)" },
    { key: "fat", label: "Fat", grams: Number(userData.fat_target) ?? 0, caloriesPerGram: 9, colorVar: "var(--chart-3)" },
  ]

  const macroCalories = macros.map((m) => m.grams * m.caloriesPerGram)
  const totalMacroCalories = macroCalories.reduce((sum, c) => sum + c, 0)
  const hasMacros = totalMacroCalories > 0
  const hasFibre = Boolean(userData.fibre_target)

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4 dark:bg-card/40">
      {/* Hero: calorie goal — this is the number that actually matters day-to-day */}
      <div
        className="relative overflow-hidden rounded-xl px-4 py-3.5"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklch, var(--primary) 16%, transparent), color-mix(in oklch, var(--chart-3) 10%, transparent))",
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Flame className="size-3.5 text-primary" />
              Daily goal · {goalLabel}
            </div>
            <div
              className="mt-0.5 text-3xl font-bold leading-none text-foreground"
              style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "-0.02em" }}
            >
              {calorieTarget ? calorieTarget.toLocaleString() : "—"}
              <span className="ml-1.5 text-sm font-medium text-muted-foreground">kcal</span>
            </div>
          </div>
          <Flame className="size-9 shrink-0 text-primary/25" strokeWidth={1.5} aria-hidden="true" />
        </div>
      </div>

      {/* Macro split bar — proportional by calorie contribution, not gram count */}
      {hasMacros && (
        <div className="mt-3.5 flex h-2 w-full overflow-hidden rounded-full bg-muted">
          {macros.map((m, i) =>
            macroCalories[i] > 0 ? (
              <div
                key={m.key}
                style={{
                  width: `${(macroCalories[i] / totalMacroCalories) * 100}%`,
                  backgroundColor: m.colorVar,
                }}
              />
            ) : null
          )}
        </div>
      )}

      {/* Macro + fibre chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {macros.map((m) =>
          m.grams > 0 ? (
            <Badge key={m.key} variant="outline" className="h-6 gap-1.5 font-normal">
              <span className="size-1.5 rounded-full" style={{ backgroundColor: m.colorVar }} />
              {m.label} · {m.grams}g
            </Badge>
          ) : null
        )}
        {hasFibre && (
          <Badge variant="outline" className="h-6 gap-1.5 font-normal">
            <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--chart-4)" }} />
            Fibre · {userData.fibre_target}g
          </Badge>
        )}
        {!hasMacros && !hasFibre && (
          <span className="text-xs text-muted-foreground/70">No macro targets set</span>
        )}
      </div>
    </div>
  )
}