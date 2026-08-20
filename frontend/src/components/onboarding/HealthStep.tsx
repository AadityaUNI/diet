"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import TagField from "@/components/ui/tag-input"
import { healthStepSchema, type HealthStepValues } from "@/auth/authSchemas"
import { LoginSpinner } from "@/components/loginSpinner"

interface HealthStepProps {
  defaultValues: HealthStepValues
  submitting: boolean
  error: string | null
  onBack: () => void
  onFinish: (values: HealthStepValues) => void
}

export function HealthStep({ defaultValues, submitting, error, onBack, onFinish }: HealthStepProps) {
  const { control, handleSubmit } = useForm<HealthStepValues>({
    resolver: zodResolver(healthStepSchema),
    defaultValues,
  })

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onFinish)}>
      <Controller
        name="health_conditions"
        control={control}
        render={({ field }) => (
          <TagField
            label="Health conditions"
            values={field.value}
            onChange={field.onChange}
            placeholder="e.g. RA, diabetes"
          />
        )}
      />

      <Controller
        name="dietary_restrictions"
        control={control}
        render={({ field }) => (
          <TagField
            label="Dietary restrictions"
            values={field.value}
            onChange={field.onChange}
            placeholder="e.g. vegetarian, gluten-free"
          />
        )}
      />

      <Controller
        name="required_food_items"
        control={control}
        render={({ field }) => (
          <TagField
            label="Must-have foods"
            values={field.value}
            onChange={field.onChange}
            placeholder="e.g. chai, dal, eggs"
          />
        )}
      />

      <p className="text-xs text-muted-foreground">You can skip any of these and add them later in your profile.</p>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {submitting ? (
        <LoginSpinner description="Creating your account..." />
      ) : (
        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Get started
          </Button>
        </div>
      )}
    </form>
  )
}
