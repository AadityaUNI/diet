// components/dashboard/macros-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MacroRing } from "@/components/dashboard/macro-ring"; // your existing component

interface Macro {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface MacrosCardProps {
  ringMacros: Macro[];
  macros: Macro[];
}

export function MacrosCard({ ringMacros, macros }: MacrosCardProps) {
  return (
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
                <span className="font-mono text-xs font-semibold" style={{ color: m.color }}>
                  {m.value}g / {m.max}g
                </span>
              </div>
              <Progress value={(m.value / m.max) * 100} indicatorColor={m.color} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}