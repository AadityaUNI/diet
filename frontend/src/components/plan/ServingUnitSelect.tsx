import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { ServingUnit } from "@/types/plan-editor";

type ServingUnitSelectProps = {
  value: ServingUnit;
  cupServing: number | null;
  wholeServing: number | null;
  onChange: (unit: ServingUnit) => void;
  className?: string;
};

export function ServingUnitSelect({
  value,
  cupServing,
  wholeServing,
  onChange,
  className = "",
}: ServingUnitSelectProps) {
  const [open, setOpen] = useState(false);
  const options = [
    { value: "grams" as const, label: "Grams", description: "Enter weight", available: true },
    { value: "cups" as const, label: "Cups", description: cupServing ? `${cupServing}g per cup` : "", available: Boolean(cupServing && cupServing > 0) },
    { value: "pieces" as const, label: "Pieces", description: wholeServing ? `${wholeServing}g per piece` : "", available: Boolean(wholeServing && wholeServing > 0) },
  ].filter((option) => option.available);
  const selectedOption = options.find((option) => option.value === value) ?? options[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Serving unit"
            className={cn("h-10 min-w-24 justify-between gap-2 rounded-xl px-3 text-xs", className)}
          />
        }
      >
        <span className="flex items-center gap-1.5">
          <span>{selectedOption?.label ?? "Grams"}</span>
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 gap-1 rounded-2xl p-1.5">
        <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Portion unit
        </p>
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-muted",
                isSelected && "bg-primary/10 text-foreground"
              )}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {/* <span className={cn(
                "flex size-7 items-center justify-center rounded-lg bg-secondary text-muted-foreground",
                isSelected && "bg-primary/15 text-primary"
              )}>
              </span> */}
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold">{option.label}</span>
                <span className="block text-[10px] text-muted-foreground">{option.description}</span>
              </span>
              {isSelected && <Check className="size-4 text-primary" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
