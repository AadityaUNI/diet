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
import { Check, ChevronLeft, ChevronRight, CircleUserRound, Dumbbell, Loader2, SlidersHorizontal, Target } from "lucide-react"
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
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form whenever the dialog is (re)opened with fresh userData
  useEffect(() => {
    if (open) {
      const timeout = window.setTimeout(() => {
        setForm(userData)
        setStep(0)
        setError(null)
      }, 0)

      return () => window.clearTimeout(timeout)
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
      await updateUserDetails(id as string, form)
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold"
            style={{ fontFamily: "Outfit, sans-serif", letterSpacing: "-0.02em" }}
          >
            Edit Profile <span className="text-primary">/ {step + 1} of 4</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-foreground/60">
            Update your details to keep your meal plans accurate.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2 sm:grid-cols-[150px_1fr]">
          <div className="grid h-fit grid-cols-4 gap-2 sm:grid-cols-1 sm:gap-1">
            {([
              ["Basics", CircleUserRound],
              ["Body", Dumbbell],
              ["Goal", Target],
              ["Preferences", SlidersHorizontal],
            ] as const).map(([label, Icon], index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                aria-label={label}
                className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-center text-xs transition-colors sm:flex-row sm:gap-2 sm:px-2 sm:text-left ${step === index ? "bg-primary/10 font-semibold text-primary" : "text-muted-foreground hover:bg-muted"}`}
              >
                <span className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] ${step === index ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                  {step > index ? <Check size={12} /> : <Icon size={13} />}
                </span>
                <span className="text-[10px] leading-none sm:text-xs sm:leading-normal">{label}</span>
              </button>
            ))}
          </div>

          <div className="min-h-70">
          {step === 0 && <div className="grid gap-4">
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
          </div>}

          {step === 2 && <div className="grid gap-4">
          <div className="grid gap-1.5">
            <Label className="text-xs text-foreground/70">Fitness Goal</Label>
            <Select name="goals" value={form.fitness_goals ?? ""} onValueChange={(v) => update("fitness_goals", v as string)} required>
              <SelectTrigger className="w-45">
                <SelectValue placeholder="Goal"/>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="cut">Cut</SelectItem>
                  <SelectItem value="bulk">Bulk</SelectItem>
                  <SelectItem value="maintain">Maintain</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

           
          </div>
          </div>}

          {step === 1 && <div className="grid gap-4">
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
          </div>}

          {step === 3 && <div className="grid gap-4">
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
          </div>}

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
          </div>
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
          {step > 0 && <Button variant="outline" size="sm" onClick={() => setStep(step - 1)} disabled={saving} className="gap-1.5"><ChevronLeft size={14} /> Back</Button>}
          {step < 3 ? (
            <Button size="sm" onClick={() => setStep(step + 1)} disabled={saving} className="gap-1.5">Next <ChevronRight size={14} /></Button>
          ) : (
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving && <Loader2 size={13} className="animate-spin" />}
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}