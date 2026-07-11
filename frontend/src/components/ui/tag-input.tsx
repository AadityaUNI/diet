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
    <div className="grid gap-1.5">
      <Label className="text-xs text-foreground/70">{label}</Label>
      <div className="flex gap-2">
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
          className="h-9 text-sm"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 shrink-0"
          onClick={addTag}
        >
          Add
        </Button>
      </div>
      {(values && values.length > 0) && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {values.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="gap-1 pr-1 text-[11px] font-normal"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-foreground/10"
              >
                <X size={10} />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}