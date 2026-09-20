"use client"

import { Controller, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { macroStepSchema, type MacroStepValues } from "@/auth/authSchemas"
import { MACRO_PRESETS } from "@/lib/predefined"
import { calculateCalorieTarget } from "@/lib/calorieTarget"
import type { UserProfile } from "@/types/types"
import {z} from "zod"

interface MacroStepProps {
  defaultValues: MacroStepValues
  profile: Pick<UserProfile, "age" | "weight" | "height" | "sex" | "activity_level" | "fitness_goals">
  onBack: () => void
  onContinue: (values: MacroStepValues) => void
}

export function MacroStep({ defaultValues, profile, onBack, onContinue }: MacroStepProps) {
  type formInput = z.input<typeof macroStepSchema>;
  type formOutput = z.output<typeof macroStepSchema>;
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<formInput, any, formOutput>({
    resolver: zodResolver(macroStepSchema),
    defaultValues,
  })

  const watched = useWatch({ control })
  
  // Calculate weight in lbs (1 kg = 2.20462 lbs)
  const weightLbs = Number(profile.weight || 0) * 2.20462
  const normalizedProfile = {
    age: Number(profile.age || 0),
    weight: Number(profile.weight || 0),
    height: Number(profile.height || 0),
    sex: profile.sex || "Male",
    activity_level: profile.activity_level || "moderate",
    fitness_goals: profile.fitness_goals || "maintain"
  }
  const calorieTarget = calculateCalorieTarget(normalizedProfile)

  const handlePresetChange = (preset: string) => {
    const presetConfig = MACRO_PRESETS.find(p => p.value === preset)
    if (presetConfig && calorieTarget) {
      const targets = presetConfig.getTargets(calorieTarget, weightLbs)
      setValue("protein_target", Math.round(targets.protein))
      setValue("carbs_target", Math.round(targets.carbs))
      setValue("fat_target", Math.round(targets.fat))
      setValue("fiber_target", Math.round(targets.fibre))
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onContinue)}>
      <div className="space-y-2">
        <Label htmlFor="onboarding-macro-preset">Macro preset</Label>
        <Controller
          name="macro_preset"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={(value) => {
              field.onChange(value)
              handlePresetChange(value as string)
            }}>
              <SelectTrigger className="w-full" id="onboarding-macro-preset">
                <SelectValue placeholder="Select a preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {MACRO_PRESETS.map(({ value, label, description }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex flex-col">
                        <span>{label}</span>
                        <span className="text-xs text-muted-foreground">{description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.macro_preset && <p className="text-xs text-destructive">{errors.macro_preset.message}</p>}
      </div>

      <div className="space-y-4 rounded-xl border border-border/60 bg-card/50 p-4">
        <div className="space-y-2">
          <Label htmlFor="protein-target">Protein (g)</Label>
          <Input
            id="protein-target"
            type="number"
            min="50"
            max="300"
            step="1"
            {...register("protein_target", { valueAsNumber: true })}
          />
          {errors.protein_target && <p className="text-xs text-destructive">{errors.protein_target.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="carbs-target">Carbs (g)</Label>
          <Input
            id="carbs-target"
            type="number"
            min="0"
            max="500"
            step="1"
            {...register("carbs_target", { valueAsNumber: true })}
          />
          {errors.carbs_target && <p className="text-xs text-destructive">{errors.carbs_target.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fat-target">Fat (g)</Label>
          <Input
            id="fat-target"
            type="number"
            min="20"
            max="150"
            step="1"
            {...register("fat_target", { valueAsNumber: true })}
          />
          {errors.fat_target && <p className="text-xs text-destructive">{errors.fat_target.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="fiber-target">Fiber (g)</Label>
          <Input
            id="fiber-target"
            type="number"
            min="10"
            max="60"
            step="1"
            {...register("fiber_target", { valueAsNumber: true })}
          />
          {errors.fiber_target && <p className="text-xs text-destructive">{errors.fiber_target.message}</p>}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button type="submit" className="flex-1">
          Continue
        </Button>
      </div>
    </form>
  )
}
