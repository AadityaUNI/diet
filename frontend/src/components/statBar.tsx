import { Flame, TrendingUp, Calendar } from "lucide-react"
import { Card, CardContent } from "./ui/card"
export default function StatBar()
{
    return (<div className="mb-5 grid grid-cols-3 gap-2.5">
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
        </div>)
}