import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FoodItem } from "@/types/types";

type FoodCommandSelectProps = {
  value: string; // currently selected food name
  foods: FoodItem[];
  isLoading?: boolean;
  onSelect: (food: FoodItem) => void;
  onCreateCustom?: () => void;
  currentUserId?: string;
};

export function FoodCommandSelect({ value, foods, isLoading, onSelect, onCreateCustom, currentUserId }: FoodCommandSelectProps) {
  const [open, setOpen] = useState(false);
  const customFoods = foods.filter((food) => food.added_by === currentUserId);
  const regionalFoods = foods.filter((food) => food.added_by !== currentUserId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
  render={
    <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal" />
  }
>
  <span className={cn("truncate", !value && "text-muted-foreground")}>
    {value || "Search ingredient..."}
  </span>
  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
</PopoverTrigger>

      <PopoverContent className="w-[min(34rem,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search by ingredient name..." />
          <CommandList className="max-h-72">
            <CommandEmpty>{isLoading ? "Loading catalog..." : "No results found."}</CommandEmpty>
              <CommandGroup heading="Your custom foods">
                {customFoods.length > 0 ? 
                  (customFoods.map((food) => (
                    <FoodCommandItem key={food.id} food={food} value={value} onSelect={onSelect} setOpen={setOpen} />
                ))) : (
                  <div className="mx-2 my-1 rounded-lg border border-dashed border-border/70 bg-muted/30 px-3 py-3 text-center">
                    <p className="text-xs font-medium text-foreground/80">No custom foods added yet</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                      Add one below and it will appear here.
                    </p>
                  </div>
                )}
                
              </CommandGroup>
          
            <CommandGroup heading="Regional food catalog">
              {regionalFoods.map((food) => (
                <FoodCommandItem key={food.id} food={food} value={value} onSelect={onSelect} setOpen={setOpen} />
              ))}
            </CommandGroup>
            {onCreateCustom && (
              <>
                <CommandSeparator />
                <CommandItem
                  value="create custom ingredient"
                  onSelect={() => {
                    onCreateCustom();
                    setOpen(false);
                  }}
                  className="gap-2 text-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add a custom ingredient
                </CommandItem>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FoodCommandItem({
  food,
  value,
  onSelect,
  setOpen,
}: {
  food: FoodItem;
  value: string;
  onSelect: (food: FoodItem) => void;
  setOpen: (open: boolean) => void;
}) {
  return (
    <CommandItem
      value={food.name}
      onSelect={() => {
        onSelect(food);
        setOpen(false);
      }}
      className="items-start gap-3 py-2.5"
    >
      <Check className={cn("mt-0.5 h-4 w-4 shrink-0", value === food.name ? "opacity-100" : "opacity-0")} />
      <span className="min-w-0 flex-1">
        <span className="block whitespace-normal wrap-break-word text-sm leading-snug">{food.name}</span>
        <span className="mt-1 block text-[10px] tabular-nums text-muted-foreground">
          {food.calories.toFixed(0)} kcal · P {food.protein.toFixed(1)}g · C {food.carbs.toFixed(1)}g · F {food.fat.toFixed(1)}g
        </span>
      </span>
    </CommandItem>
  );
}