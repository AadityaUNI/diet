"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { bodyStepSchema, type BodyStepFormValues, type BodyStepValues } from "@/auth/authSchemas"

interface BodyStepProps {
  defaultValues: BodyStepFormValues
  onBack: () => void
  onContinue: (values: BodyStepValues) => void
}

export function BodyStep({ defaultValues, onBack, onContinue }: BodyStepProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<BodyStepFormValues, unknown, BodyStepValues>({
    resolver: zodResolver(bodyStepSchema),
    defaultValues,
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onContinue)}>
      <div className="space-y-2">
        <Label htmlFor="onboarding-age">Age</Label>
        <Input id="onboarding-age" type="number" min="1" step="1" placeholder="e.g. 28" {...register("age")} />
        {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="onboarding-weight">Weight (kg)</Label>
          <Input id="onboarding-weight" type="number" min="1" step="any" placeholder="e.g. 68" {...register("weight")} />
          {errors.weight && <p className="text-xs text-destructive">{errors.weight.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="onboarding-height">Height (cm)</Label>
          <Input id="onboarding-height" type="number" min="1" step="any" placeholder="e.g. 175" {...register("height")} />
          {errors.height && <p className="text-xs text-destructive">{errors.height.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="onboarding-sex">Sex</Label>
        <Controller
          name="sex"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full" id="onboarding-sex">
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.sex && <p className="text-xs text-destructive">{errors.sex.message}</p>}
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
