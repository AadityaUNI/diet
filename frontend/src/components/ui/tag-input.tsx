import { useState } from "react"
import { Label } from "./label"
import { Button } from "./button"
import { Badge } from "./badge"
import { Input } from "./input"
import { X } from "lucide-react"

export default function TagField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label?: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder: string
}) {
  const [draft, setDraft] = useState("")
  const hasDraft = draft.trim().length > 0
  const hasTags = values && values.length > 0

  const addTag = () => {
    const trimmed = draft.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setDraft("")
  }

  const removeTag = (tag: string) => {
    onChange(values.filter((v) => v !== tag))
  }

  return (
    <div className="grid gap-2">
      {label && (
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium uppercase tracking-wide text-foreground/75">
            {label}
          </Label>
          <span className="text-[11px] text-muted-foreground">
            {values.length} {values.length === 1 ? "tag" : "tags"}
          </span>
        </div>
      )}

      <div className="rounded-xl border border-border/80 bg-background p-2 shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addTag()
              }
            }}
            placeholder={placeholder}
            className="h-11 border-0 bg-transparent px-2 text-sm shadow-none focus-visible:ring-0"
          />
          <Button
            type="button"
            size="sm"
            variant="default"
            className="h-10 shrink-0 px-4"
            onClick={addTag}
            disabled={!hasDraft}
          >
            Add Tag
          </Button>
        </div>

        <p className="px-2 pt-1 text-[11px] text-muted-foreground">
          Press Enter or click Add Tag
        </p>
      </div>

      {hasTags && (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="h-8 gap-1.5 rounded-full px-3 text-sm font-medium"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full p-1 transition-colors hover:bg-foreground/15"
                aria-label={`Remove ${tag}`}
              >
                <X size={12} />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {!hasTags && (
        <p className="text-xs text-muted-foreground">No tags added yet.</p>
      )}
    </div>
  )
}