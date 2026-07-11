import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Macro {
  label: string;
  value: number;
  max: number;
  color: string;
}

interface MacrosCardProps {
  macros: Macro[];
}

function MacroRing({ label, value, max, color, size = 80 }: {
  label: string;
  value: number;
  max: number;
  color: string;
  unit?: string;
  size?: number;
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
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-bold text-foreground leading-none" style={{ fontFamily: "DM Mono, monospace" }}>
            {value}
          </span>
          <span className="text-[10px] text-muted-foreground">g</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function MacrosCard({ macros }: MacrosCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Macros</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="mb-5 flex justify-around">
          {macros.map((m) => (
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