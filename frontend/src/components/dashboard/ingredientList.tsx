import { formatQuantity, servingEquivalents, type ServingDisplayItem } from "@/lib/displayServings";

interface IngredientListProps {
  ingredients: ServingDisplayItem[];
}

// Name on the left, grams with cup/piece equivalents underneath on the right,
// so amounts line up in one column regardless of name length.
export function IngredientList({ ingredients }: IngredientListProps) {
  return (
    <ul
      className="mt-2 divide-y divide-border/60 rounded-lg bg-background/60 px-3"
      onClick={(event) => event.stopPropagation()}
    >
      {ingredients.map((ingredient, index) => {
        const servings = servingEquivalents(ingredient);
        return (
          <li key={`${ingredient.name}-${index}`} className="flex items-start justify-between gap-3 py-2">
            <span className="min-w-0 break-words text-xs leading-snug text-foreground/85">{ingredient.name}</span>
            <span className="flex shrink-0 flex-col items-end gap-0.5 text-right">
              <span className="font-mono text-xs font-semibold tabular-nums">{formatQuantity(ingredient.amount)} g</span>
              {servings.length > 0 && (
                <span className="text-[11px] leading-none text-muted-foreground">{servings.join(" · ")}</span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
