"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ACTIVITY_LEVELS } from "@/lib/predefined"
import { goalsStepSchema, type GoalsStepValues } from "@/auth/authSchemas"

interface GoalsStepProps {
  defaultValues: GoalsStepValues
  onBack: () => void
  onContinue: (values: GoalsStepValues) => void
}

export function GoalsStep({ defaultValues, onBack, onContinue }: GoalsStepProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<GoalsStepValues>({
    resolver: zodResolver(goalsStepSchema),
    defaultValues,
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onContinue)}>
      <div className="space-y-2">
        <Label htmlFor="onboarding-goals">Fitness goal</Label>
        <Controller
          name="goals"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full" id="onboarding-goals">
                <SelectValue placeholder="Select a goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="cut">Cut — Lose fat, keep muscle</SelectItem>
                  <SelectItem value="bulk">Bulk — Gain muscle mass</SelectItem>
                  <SelectItem value="maintain">Maintain — Hold current weight</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.goals && <p className="text-xs text-destructive">{errors.goals.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="onboarding-activity">Activity level</Label>
        <Controller
          name="activity"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full" id="onboarding-activity">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {ACTIVITY_LEVELS.map(({ value, label, desc }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex flex-col">
                        <span>{label}</span>
                        <span className="text-xs text-muted-foreground">{desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
        {errors.activity && <p className="text-xs text-destructive">{errors.activity.message}</p>}
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
