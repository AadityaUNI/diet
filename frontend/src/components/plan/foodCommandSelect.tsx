import { useRef, useState } from "react";
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
  excludedFoodIds?: number[]; // foods already used elsewhere in the meal
};

export function FoodCommandSelect({ value, foods, isLoading, onSelect, onCreateCustom, currentUserId, excludedFoodIds = [] }: FoodCommandSelectProps) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const customFoods = foods.filter((food) => food.added_by === currentUserId);
  const regionalFoods = foods.filter((food) => food.added_by !== currentUserId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
  render={
    // comboboxes don't take their accessible name from their content, so label it explicitly
    <Button
      variant="outline"
      role="combobox"
      aria-expanded={open}
      aria-label={value ? `Ingredient: ${value}` : "Choose ingredient"}
      className="w-full justify-between font-normal"
    />
  }
>
  <span className={cn("truncate", !value && "text-muted-foreground")}>
    {value || "Search ingredient..."}
  </span>
  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
</PopoverTrigger>

      <PopoverContent className="w-[min(34rem,calc(100vw-2rem))] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search by ingredient name..."
            // cmdk scrolls its highlighted item into view after re-sorting; pin results to the top instead
            onValueChange={() => requestAnimationFrame(() => listRef.current?.scrollTo({ top: 0 }))}
          />
          <CommandList ref={listRef} className="max-h-72">
            <CommandEmpty>{isLoading ? "Loading catalog..." : "No results found."}</CommandEmpty>
              <CommandGroup heading="Your custom foods">
                {customFoods.length > 0 ? 
                  (customFoods.map((food) => (
                    <FoodCommandItem key={food.id} food={food} value={value} onSelect={onSelect} setOpen={setOpen} disabled={excludedFoodIds.includes(food.id)} />
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
                <FoodCommandItem key={food.id} food={food} value={value} onSelect={onSelect} setOpen={setOpen} disabled={excludedFoodIds.includes(food.id)} />
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
  disabled = false,
}: {
  food: FoodItem;
  value: string;
  onSelect: (food: FoodItem) => void;
  setOpen: (open: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <CommandItem
      value={food.name}
      disabled={disabled}
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
          {disabled && " · Already in this meal"}
        </span>
      </span>
    </CommandItem>
  );
}