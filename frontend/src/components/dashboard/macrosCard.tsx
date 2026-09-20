import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Macro {
  label: string;
  value: number;
  max: number;
  color: string;
  planAmount?: number;
}

interface MacrosCardProps {
  macros: Macro[];
}

export function MacrosCard({ macros }: MacrosCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Macros</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col gap-4">
          {macros.map((m) => (
            <div key={m.label}>
              <div className="mb-1.5 flex justify-between">
                <span className="text-xs text-muted-foreground">{m.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold" style={{ color: m.color }}>
                    {m.value}g / {m.max}g
                  </span>
                  {m.planAmount !== undefined && (
                    <span className="text-[10px] text-muted-foreground">
                      (Plan: {m.planAmount}g)
                    </span>
                  )}
                </div>
              </div>
              <Progress value={m.max > 0 ? Math.min((m.value / m.max) * 100, 100) : 0} indicatorColor={m.color} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}