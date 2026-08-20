interface PlanMacroChipsProps {
  chips: { label: string; value: string; color: string; chip?: string }[];
}

export function PlanMacroChips({ chips }: PlanMacroChipsProps) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {chips.map((m) => (
        <div key={m.label} className={`rounded-lg px-2 py-1 ${m.chip ?? "bg-secondary/50"}`}>
          <span className={`block font-mono text-xs font-bold leading-none ${m.color}`}>{m.value}</span>
          <span className="text-[10px] text-muted-foreground">{m.label}</span>
        </div>
      ))}
    </div>
  );
}
