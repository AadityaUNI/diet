import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import TagField from "./ui/tag-input"
import type { UserProfile } from "@/types/types"
import { ACTIVITY_LEVELS } from "@/lib/predefined"
import { updateUserDetails } from "@/auth/UserService"

interface EditProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userData: UserProfile
  onSaved: (updated: UserProfile) => void
}

// Reusable comma-in / chip-out field for string[] properties


export function EditProfileDialog({
  open,
  onOpenChange,
  userData,
  onSaved,
}: EditProfileDialogProps) {
  const [form, setForm] = useState<UserProfile>(userData)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form whenever the dialog is (re)opened with fresh userData
  useEffect(() => {
    if (open) {
      setForm(userData)
      setError(null)
    }
  }, [open, userData])

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const {id} = form
      // console.log("passing in : " , form, form.health_conditions)
      updateUserDetails(id as string, form)
      onSaved(form)
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-120 border-primary/20">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold"
            style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "-0.02em" }}
          >
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-foreground/60">
            Update your details to keep your meal plans accurate.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-1.5">
            <Label className="text-xs text-foreground/70">Name</Label>
            <Input
              value={form.name ?? ""}
              onChange={(e) => update("name", e.target.value)}
              className="h-9 text-sm"
              required
            />
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-foreground/70">Region</Label>
            <Select name="region" value={form.region ?? ""} onValueChange={(v) => update("region", v as string)} required>
            <SelectTrigger className="w-45">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="IN">India</SelectItem>
                <SelectItem value="AU">Australia</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          </div>

          <div className="grid gap-1.5">
            <Label className="text-xs text-foreground/70">Fitness Goal</Label>
            <Input
              value={form.fitness_goals ?? ""}
              onChange={(e) => update("fitness_goals", e.target.value)}
              placeholder="e.g. Lean bulk, fat loss"
              className="h-9 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs text-foreground/70">Weight (kg)</Label>
              <Input
                type="number"
                value={form.weight ?? ""}
                onChange={(e) => update("weight", Number(e.target.value))}
                className="h-9 text-sm"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs text-foreground/70">Height (cm)</Label>
              <Input
                type="number"
                value={form.height ?? ""}
                onChange={(e) => update("height", Number(e.target.value))}
                className="h-9 text-sm"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="text-xs text-foreground/70">Sex</Label>
              <Select
                value={form.sex ?? ""}
                onValueChange={(v) => update("sex", v as string)}
                required
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label className="text-xs text-foreground/70">Activity Level</Label>
              <Select
                value={form.activity_level ?? ""}
                onValueChange={(v) => update("activity_level", v as string)}
                required
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <TagField
            label="Dietary Restrictions"
            values={form.dietary_restrictions ?? []}
            onChange={(v) => update("dietary_restrictions", v)}
            placeholder="e.g. vegetarian, halal"
          />

          <TagField
            label="Health Conditions"
            values={form.health_conditions ?? []}
            onChange={(v) => update("health_conditions", v)}
            placeholder="e.g. diabetes, hypertension"
          />

          <TagField
            label="Required Food Items"
            values={form.required_food_items ?? []}
            onChange={(v) => update("required_food_items", v)}
            placeholder="e.g. paneer, lentils"
          />

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5 bg-primary hover:bg-primary/90"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}